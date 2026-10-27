import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { completeUserProfile } from "@/lib/profile.functions";

export const PERFIS = ["Doador", "Receptor", "Ambos"] as const;
export type Perfil = (typeof PERFIS)[number];

export interface SignupFields {
  nome: string;
  email: string;
  telefone: string;
  bairro: string;
  tipo_pessoa: "Física" | "Jurídica";
  tipo_perfil: Perfil;
}

// Profile IDs are always taken from authentication, never from signup fields.
export function toUsuario(fields: SignupFields, authenticatedId: string): Database["public"]["Tables"]["USUARIO"]["Insert"] {
  if (!authenticatedId) throw new Error("Usuário autenticado obrigatório.");
  if (!PERFIS.includes(fields.tipo_perfil)) throw new Error("Perfil inválido.");
  return {
    auth_id: authenticatedId,
    nome: fields.nome.trim(),
    email: fields.email.trim(),
    telefone: fields.telefone.trim() || null,
    bairro: fields.bairro.trim() || null,
    tipo_pessoa: fields.tipo_pessoa,
    tipo_perfil: fields.tipo_perfil,
  };
}

export async function registerUser(fields: SignupFields, password: string, origin: string) {
  const { email, auth_id: _authId, ...profile } = toUsuario(fields, "pending");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/entrar`,
      data: {
        nome: profile.nome,
        tipo_pessoa: profile.tipo_pessoa,
        tipo_perfil: profile.tipo_perfil,
        greenshare_profile: { ...profile, telefone: fields.telefone.trim(), bairro: fields.bairro.trim() },
      },
    },
  });
  if (error) throw new Error(authError(error));
  if (!data.session) return { confirmationRequired: true as const, user: null };
  const { data: verified, error: validationError } = await supabase.auth.getUser();
  if (validationError || !verified.user) throw new Error("Entre para concluir seu cadastro.");
  return { confirmationRequired: false as const, user: verified.user };
}

// One completion per browser identity at a time; retry does not insert an existing row.
const completions = new Map<string, ReturnType<typeof completeUserProfile>>();
export function ensureUserProfile(userId: string) {
  const existing = completions.get(userId);
  if (existing) return existing;
  const promise = completeUserProfile().finally(() => completions.delete(userId));
  completions.set(userId, promise);
  return promise;
}

export function authError(error: { message: string; code?: string | undefined; status?: number | undefined }): string {
  if (error.code === "invalid_credentials") return "E-mail ou senha incorretos.";
  if (error.code === "email_not_confirmed") return "Confirme seu e-mail antes de entrar.";
  if (error.code === "user_already_exists") return "Esta conta já existe. Use a opção Entrar.";
  if (error.code === "weak_password") return "Escolha uma senha mais forte, com pelo menos 6 caracteres.";
  if (error.code === "over_request_rate_limit" || error.code === "over_email_send_rate_limit") return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  if (error.code === "unexpected_failure" || (error.status !== undefined && error.status >= 500)) return "O serviço de contas não conseguiu concluir a solicitação. Tente novamente em alguns minutos; se o problema persistir, avise a organização.";
  return "Não foi possível acessar sua conta. Tente novamente.";
}

export async function loginUser(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error(authError(error));
  const { data, error: validationError } = await supabase.auth.getUser();
  if (validationError || !data.user) throw new Error("Não foi possível validar sua conta. Tente entrar novamente.");
  return data.user;
}

export async function logoutUser(cache: { cancelQueries: () => Promise<unknown>; clear: () => void }) {
  await cache.cancelQueries();
  cache.clear();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error("Não foi possível sair. Tente novamente.");
}