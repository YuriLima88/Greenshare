import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const pendingProfile = z.object({
  nome: z.string().trim().min(1).max(200),
  telefone: z.string().trim().max(40),
  bairro: z.string().trim().max(200),
  tipo_pessoa: z.enum(["Física", "Jurídica"]),
  tipo_perfil: z.enum(["Doador", "Receptor", "Ambos"]),
});

export const completeUserProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user || auth.user.id !== userId) throw new Error("Entre novamente para concluir seu cadastro.");
    const user = auth.user;
    if (!user.email_confirmed_at || !user.email) throw new Error("Confirme seu e-mail antes de concluir seu cadastro.");
    const read = () => supabase.from("USUARIO").select("id_usuario").eq("auth_id", userId).limit(1).maybeSingle();
    const existing = await read();
    if (existing.error) throw new Error("Não foi possível consultar seu cadastro. Tente novamente.");
    if (existing.data) return { status: "ready" as const, id: existing.data.id_usuario };
    const parsed = pendingProfile.safeParse(user.user_metadata['greenshare_profile']);
    if (!parsed.success) return { status: "missing" as const, id: null };
    const row = { ...parsed.data, email: user.email, auth_id: userId, telefone: parsed.data.telefone || null, bairro: parsed.data.bairro || null };
    // id_usuario is intentionally omitted: the existing database generates it.
    const result = await supabase.from("USUARIO").insert(row).select("id_usuario").single();
    if (result.error) {
      // Recover a concurrent completion only when an existing row can be read.
      const retry = await read();
      if (retry.data) return { status: "ready" as const, id: retry.data.id_usuario };
      throw new Error("Sua conta foi autenticada, mas não foi possível concluir seu cadastro. Tente novamente, sem criar outra conta.");
    }
    return { status: "ready" as const, id: result.data.id_usuario };
  });