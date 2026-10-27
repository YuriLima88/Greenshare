import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Donation } from "@/lib/donations";
import { assertReservable, canCancelReservation, foodDate, reservationStatus } from "@/lib/reservations";

vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: {} }));
vi.mock("@tanstack/react-start", () => ({ createServerFn: () => {
  const builder = { middleware: () => builder, inputValidator: () => builder, handler: (fn: unknown) => fn };
  return builder;
} }));
import { createReservation, cancelReservation, listMyReservations } from "@/lib/reservations.functions";

const now = new Date("2026-10-27T02:05:00Z");
const donation: Donation = { id_doacao: 42, id_usuario_doador: 7, status: "Disponivel", titulo: "Alimentos", descricao: "Descrição", categoria: "Frutas", quantidade: 2.5, unidade_medida: "kg", janela_retirada_inicio: "2026-10-27T10:00:00Z", janela_retirada_fim: "2026-10-29T18:00:00Z", data_validade: "2026-10-29", foto_url: null, local_retirada: "Local", criado_em: now.toISOString(), atualizado_em: now.toISOString() };
const reservation = { id_reserva: 9, id_doacao: 42, id_usuario_receptor: 8, status_reserva: "Ativa", data_reserva: now.toISOString(), expira_em: "2026-10-28T02:05:00Z", data_retirada: null };
const terminal = vi.fn();
const insert = vi.fn();
const update = vi.fn();
const eq = vi.fn();
const gt = vi.fn();
const from = vi.fn();
const chain = { select: vi.fn(), eq, gt, order: vi.fn(), range: terminal, single: terminal, maybeSingle: terminal, insert, update };
type Handler = (args: { data: number; context: { userId: string; supabase: { from: typeof from } } }) => Promise<unknown>;
const run = (fn: unknown, id = 42) => (fn as Handler)({ data: id, context: { userId: "verified-uuid", supabase: { from } } });

beforeEach(() => {
  vi.resetAllMocks(); vi.useFakeTimers(); vi.setSystemTime(now);
  from.mockReturnValue(chain);
  chain.select.mockReturnValue(chain); eq.mockReturnValue(chain); gt.mockReturnValue(chain); chain.order.mockReturnValue(chain);
  insert.mockReturnValue(chain); update.mockReturnValue(chain);
});

afterEach(() => vi.useRealTimers());

describe("Reservation validation", () => {
  it("allows another user's available future-dated food", () => { expect(() => assertReservable(donation, 8, now)).not.toThrow(); });
  it("rejects the donor's own donation", () => { expect(() => assertReservable(donation, 7, now)).toThrow("própria"); });
  it.each(["Inativo", "Reservado", "Entregue"])("rejects status %s", status => { expect(() => assertReservable({ ...donation, status }, 8, now)).toThrow("disponível"); });
  it("rejects ended pickup windows including the exact end", () => { expect(() => assertReservable({ ...donation, janela_retirada_fim: now.toISOString() }, 8, now)).toThrow("terminou"); });
  it("rejects food expired before the current Sao Paulo day", () => { expect(() => assertReservable({ ...donation, data_validade: "2026-10-25" }, 8, now)).toThrow("expirou"); });
  it("keeps food valid throughout its local validity day", () => { expect(foodDate(now)).toBe("2026-10-26"); expect(() => assertReservable({ ...donation, data_validade: "2026-10-26" }, 8, now)).not.toThrow(); });
  it("allows unspecified validity with a future pickup window", () => { expect(() => assertReservable({ ...donation, data_validade: null }, 8, now)).not.toThrow(); });
  it("only permits cancellation of unexpired active reservations", () => { expect(canCancelReservation(reservation, now)).toBe(true); expect(canCancelReservation({ ...reservation, status_reserva: "Cancelada" }, now)).toBe(false); expect(canCancelReservation({ ...reservation, expira_em: now.toISOString() }, now)).toBe(false); });
  it("shows time-expired reservations without writing status", () => { expect(reservationStatus({ ...reservation, expira_em: now.toISOString() }, now)).toBe("Expirada"); });
});

describe("RLS-scoped reservation operations", () => {
  it("derives recipient from auth_id and leaves the synchronized 24-hour clock to database defaults", async () => {
    terminal.mockResolvedValueOnce({ data: { id_usuario: 8 } }).mockResolvedValueOnce({ data: donation }).mockResolvedValueOnce({ data: reservation });
    expect(await run(createReservation)).toEqual(reservation);
    expect(eq).toHaveBeenCalledWith("auth_id", "verified-uuid");
    expect(insert).toHaveBeenCalledWith({ id_doacao: 42, id_usuario_receptor: 8, status_reserva: "Ativa" });
    expect(insert.mock.calls[0]?.[0]).not.toHaveProperty("expira_em");
    expect(insert.mock.calls[0]?.[0]).not.toHaveProperty("data_reserva");
    expect(update).not.toHaveBeenCalled();
  });
  it("does not insert when the server finds old pickup dates", async () => {
    terminal.mockResolvedValueOnce({ data: { id_usuario: 8 } }).mockResolvedValueOnce({ data: { ...donation, janela_retirada_fim: "2026-10-20T18:00:00Z" } });
    await expect(run(createReservation)).rejects.toThrow("terminou"); expect(insert).not.toHaveBeenCalled(); expect(update).not.toHaveBeenCalled();
  });
  it("handles the existing unique-active index without changing donation status", async () => {
    terminal.mockResolvedValueOnce({ data: { id_usuario: 8 } }).mockResolvedValueOnce({ data: donation }).mockResolvedValueOnce({ error: { code: "23505" } });
    await expect(run(createReservation)).rejects.toThrow("reserva ativa"); expect(update).not.toHaveBeenCalled();
  });
  it("cancels only the recipient's active row with status-only update", async () => {
    terminal.mockResolvedValueOnce({ data: { id_usuario: 8 } }).mockResolvedValueOnce({ data: reservation }).mockResolvedValueOnce({ data: { ...reservation, status_reserva: "Cancelada" } });
    await run(cancelReservation, 9);
    expect(update).toHaveBeenCalledExactlyOnceWith({ status_reserva: "Cancelada" });
    expect(eq).toHaveBeenCalledWith("id_usuario_receptor", 8); expect(eq).toHaveBeenCalledWith("status_reserva", "Ativa"); expect(gt).toHaveBeenCalledWith("expira_em", now.toISOString());
    expect(from.mock.calls.map(c => c[0])).toEqual(["USUARIO", "RESERVA", "RESERVA"]);
  });
  it("rejects expired cancellation without writing", async () => {
    terminal.mockResolvedValueOnce({ data: { id_usuario: 8 } }).mockResolvedValueOnce({ data: { ...reservation, expira_em: now.toISOString() } });
    await expect(run(cancelReservation, 9)).rejects.toThrow("ativa"); expect(update).not.toHaveBeenCalled();
  });
  it("retains reservations when existing RLS hides embedded donation details", async () => {
    terminal.mockResolvedValueOnce({ data: { id_usuario: 8 } }).mockResolvedValueOnce({ data: [{ ...reservation, DOACAO: null }] });
    expect(await run(listMyReservations)).toEqual([{ ...reservation, DOACAO: null }]); expect(eq).toHaveBeenCalledWith("id_usuario_receptor", 8);
  });
});