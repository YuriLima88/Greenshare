import type { Donation } from "./donations";

export function foodDate(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => parts.find(p => p.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function reservationUnavailable(donation: Pick<Donation, "status" | "janela_retirada_fim" | "data_validade">, now = new Date()): string | null {
  if (donation.status !== "Disponivel") return "Esta doação não está disponível para reserva.";
  const pickupEnd = Date.parse(donation.janela_retirada_fim);
  if (!Number.isFinite(pickupEnd) || pickupEnd <= now.getTime()) return "O período de retirada desta doação já terminou.";
  if (donation.data_validade && donation.data_validade < foodDate(now)) return "A validade do alimento já expirou.";
  return null;
}

export function assertReservable(donation: Donation, recipientId: number, now = new Date()) {
  if (donation.id_usuario_doador === recipientId) throw new Error("Você não pode reservar sua própria doação.");
  const reason = reservationUnavailable(donation, now);
  if (reason) throw new Error(reason);
}

export function canCancelReservation(reservation: { status_reserva: string; expira_em: string }, now = new Date()) {
  return reservation.status_reserva === "Ativa" && Date.parse(reservation.expira_em) > now.getTime();
}

export function reservationStatus(reservation: { status_reserva: string; expira_em: string }, now = new Date()) {
  if (reservation.status_reserva === "Ativa" && Date.parse(reservation.expira_em) <= now.getTime()) return "Expirada";
  return reservation.status_reserva === "Concluida" ? "Concluída" : reservation.status_reserva;
}

export function reservationWriteError(code?: string): string {
  if (code === "23505") return "Esta doação já possui uma reserva ativa. Atualize a lista de doações.";
  if (code === "42501") return "Não foi possível reservar: a doação está indisponível ou sua conta não tem permissão.";
  return "Não foi possível reservar a doação. Atualize a página e tente novamente.";
}