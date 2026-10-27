import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ signInWithPassword: vi.fn(), getUser: vi.fn(), signUp: vi.fn(), signOut: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth } }));
const complete = vi.hoisted(() => vi.fn());
vi.mock("@/lib/profile.functions", () => ({ completeUserProfile: complete }));
import { loginUser, logoutUser, registerUser, toUsuario, type SignupFields } from "@/lib/auth";

beforeEach(() => vi.resetAllMocks());
describe("Existing Supabase authentication", () => {
  it.each(["Doador", "Receptor", "Ambos"] as const)("maps %s to USUARIO with authenticated UUID and no generated ID", (perfil) => {
    const fields: SignupFields = { nome: " Maria ", email: "maria@example.org", telefone: "", bairro: "", tipo_pessoa: "Física", tipo_perfil: perfil };
    const row = toUsuario(fields, "00000000-0000-4000-8000-000000000001");
    expect(row.auth_id).toBe("00000000-0000-4000-8000-000000000001");
    expect(row.tipo_perfil).toBe(perfil);
    expect(row).not.toHaveProperty("id_usuario");
  });
  it("waits for email confirmation without inserting a profile or trusting an unconfirmed user", async () => {
    auth.signUp.mockResolvedValue({ data: { session: null, user: { id: "unconfirmed" } }, error: null });
    const fields: SignupFields = { nome: "Maria", email: "maria@example.org", telefone: "", bairro: "", tipo_pessoa: "Física", tipo_perfil: "Ambos" };
    expect(await registerUser(fields, "password", "https://greenshare.example")).toEqual({ confirmationRequired: true, user: null });
    expect(auth.getUser).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
    expect(auth.signUp).toHaveBeenCalledWith(expect.objectContaining({ options: { emailRedirectTo: "https://greenshare.example/entrar", data: { nome: "Maria", tipo_pessoa: "Física", tipo_perfil: "Ambos", greenshare_profile: { nome: "Maria", telefone: "", bairro: "", tipo_pessoa: "Física", tipo_perfil: "Ambos" } } } }));
  });
  it.each(["Doador", "Receptor", "Ambos"] as const)("sends %s and form values directly in metadata for the existing signup trigger", async (perfil) => {
    auth.signUp.mockResolvedValue({ data: { session: null, user: null }, error: null });
    await registerUser({ nome: " Associação Verde ", email: "contato@example.org", telefone: "", bairro: "", tipo_pessoa: "Jurídica", tipo_perfil: perfil }, "password", "https://greenshare.example");
    expect(auth.signUp).toHaveBeenCalledWith(expect.objectContaining({ options: expect.objectContaining({ data: expect.objectContaining({ nome: "Associação Verde", tipo_pessoa: "Jurídica", tipo_perfil: perfil }) }) }));
  });
  it("rejects an Auth server failure without validating or completing a profile", async () => {
    auth.signUp.mockResolvedValue({ data: { session: null, user: null }, error: { code: "unexpected_failure", status: 500, message: "Database error saving new user" } });
    await expect(registerUser({ nome: "Maria", email: "maria@example.org", telefone: "", bairro: "", tipo_pessoa: "Física", tipo_perfil: "Ambos" }, "password", "https://greenshare.example")).rejects.toThrow("O serviço de contas não conseguiu concluir a solicitação.");
    expect(auth.getUser).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
  });
  it("validates an immediate signup session before showing the account", async () => {
    auth.signUp.mockResolvedValue({ data: { session: {}, user: { id: "untrusted" } }, error: null });
    auth.getUser.mockResolvedValue({ data: { user: { id: "verified" } }, error: null });
    expect(await registerUser({ nome: "Maria", email: "maria@example.org", telefone: "", bairro: "", tipo_pessoa: "Física", tipo_perfil: "Doador" }, "password", "https://greenshare.example")).toEqual({ confirmationRequired: false, user: { id: "verified" } });
  });
  it("validates the signed-in user through Auth", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: null });
    auth.getUser.mockResolvedValue({ data: { user: { id: "validated-user" } }, error: null });
    expect(await loginUser(" maria@example.org ", "password")).toEqual({ id: "validated-user" });
    expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: "maria@example.org", password: "password" });
    expect(auth.getUser).toHaveBeenCalledOnce();
  });
  it("does not treat rejected credentials as a login", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: { code: "invalid_credentials", message: "Invalid login credentials" } });
    await expect(loginUser("maria@example.org", "wrong")).rejects.toThrow();
    expect(auth.getUser).not.toHaveBeenCalled();
  });
  it("cancels and clears private cached data before signing out", async () => {
    const order: string[] = [];
    auth.signOut.mockImplementation(async () => { order.push("signout"); return { error: null }; });
    await logoutUser({ cancelQueries: async () => { order.push("cancel"); }, clear: () => { order.push("clear"); } });
    expect(order).toEqual(["cancel", "clear", "signout"]);
  });
});