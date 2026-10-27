import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: {} }));
vi.mock("@tanstack/react-start", () => ({ createServerFn: () => ({ middleware: () => ({ handler: (fn: unknown) => fn }) }) }));
import { completeUserProfile } from "@/lib/profile.functions";

const read = vi.fn();
const insertResult = vi.fn();
const insert = vi.fn(() => ({ select: () => ({ single: insertResult }) }));
const from = vi.fn(() => ({ select: () => ({ eq: () => ({ limit: () => ({ maybeSingle: read }) }) }), insert }));
const getUser = vi.fn();
const userId = "00000000-0000-4000-8000-000000000001";
type TestHandler = (args: { context: { userId: string; supabase: { auth: { getUser: typeof getUser }; from: typeof from } } }) => Promise<{ status: string; id: number | null }>;
const run = () => (completeUserProfile as unknown as TestHandler)({ context: { userId, supabase: { auth: { getUser }, from } } });
const confirmed = { id: userId, email: "maria@example.org", email_confirmed_at: "2026-10-25T03:00:00Z", user_metadata: { greenshare_profile: { nome: "Maria", telefone: "", bairro: "", tipo_pessoa: "Física", tipo_perfil: "Ambos" } } };
beforeEach(() => {
  vi.clearAllMocks();
  getUser.mockResolvedValue({ data: { user: confirmed }, error: null });
  read.mockResolvedValue({ data: null, error: null });
  insertResult.mockResolvedValue({ data: { id_usuario: 42 }, error: null });
});
describe("Authenticated profile completion", () => {
  it("does not read or insert USUARIO until email is confirmed", async () => {
    getUser.mockResolvedValue({ data: { user: { ...confirmed, email_confirmed_at: null } }, error: null });
    await expect(run()).rejects.toThrow();
    expect(from).not.toHaveBeenCalled();
  });
  it("inserts authenticated UUID and verified email with database-generated id_usuario", async () => {
    expect(await run()).toEqual({ status: "ready", id: 42 });
    expect(insert).toHaveBeenCalledWith({ auth_id: userId, email: "maria@example.org", nome: "Maria", telefone: null, bairro: null, tipo_pessoa: "Física", tipo_perfil: "Ambos" });
    expect(insert.mock.calls[0]).toHaveLength(1);
  });
  it("never overwrites or duplicates an existing profile", async () => {
    read.mockResolvedValue({ data: { id_usuario: 7 }, error: null });
    expect(await run()).toEqual({ status: "ready", id: 7 });
    expect(insert).not.toHaveBeenCalled();
  });
  it("rejects a different authenticated identity", async () => {
    getUser.mockResolvedValue({ data: { user: { ...confirmed, id: "other" } }, error: null });
    await expect(run()).rejects.toThrow();
    expect(insert).not.toHaveBeenCalled();
  });
  it("surfaces an insertion denial instead of claiming completion", async () => {
    insertResult.mockResolvedValue({ data: null, error: { code: "42501" } });
    await expect(run()).rejects.toThrow();
  });
});