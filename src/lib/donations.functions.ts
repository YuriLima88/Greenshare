import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertOwner, assertStatusChange, donationSchema } from "./donations";

const filters = z.object({ q: z.string().max(200).default(""), categoria: z.string().default(""), page: z.number().int().positive().default(1) });
export const listAvailableDonations = createServerFn({ method: "GET" }).inputValidator(filters).handler(async ({ data }) => {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error("Não foi possível conectar às doações. Tente novamente.");
  const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
    headers.set("apikey", key); return fetch(input, { ...init, headers });
  } } });
  let query = client.from("DOACAO").select("*", { count: "exact" }).eq("status", "Disponivel");
  const term = data.q.replace(/[\\%_,()."']/g, " ").trim();
  if (term) query = query.or(`titulo.ilike.%${term}%,descricao.ilike.%${term}%`);
  if (data.categoria) query = query.eq("categoria", data.categoria);
  const result = await query.order("criado_em", { ascending: false }).order("id_doacao", { ascending: false }).range((data.page - 1) * 12, data.page * 12 - 1);
  if (result.error) throw new Error("Não foi possível carregar as doações. Tente novamente.");
  return { rows: result.data, count: result.count ?? 0 };
});
export const getPublicDonation = createServerFn({ method: "GET" }).inputValidator(z.number().int().positive()).handler(async ({ data }) => {
  const url = process.env['SUPABASE_URL']; const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error("Não foi possível conectar às doações.");
  const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => { const headers = new Headers(init?.headers); if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization"); headers.set("apikey", key); return fetch(input, { ...init, headers }); } } });
  const result = await client.from("DOACAO").select("*").eq("id_doacao", data).eq("status", "Disponivel").maybeSingle();
  if (result.error) throw new Error("Não foi possível consultar a doação.");
  return result.data;
});
export const listMyDonations = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const profile = await context.supabase.from("USUARIO").select("id_usuario").eq("auth_id", context.userId).single();
  if (profile.error || !profile.data) throw new Error("Conclua seu cadastro antes de consultar suas doações.");
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    const result = await context.supabase.from("DOACAO").select("*").eq("id_usuario_doador", profile.data.id_usuario).order("criado_em", { ascending: false }).order("id_doacao", { ascending: false }).range(offset, offset + 499);
    if (result.error) throw new Error("Não foi possível consultar suas doações.");
    rows.push(...result.data); if (result.data.length < 500) break;
  }
  return rows;
});
export const saveDonation = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.number().int().positive().optional(), values: donationSchema })).handler(async ({ context, data }) => {
  const profile = await context.supabase.from("USUARIO").select("id_usuario").eq("auth_id", context.userId).single();
  if (profile.error || !profile.data) throw new Error("Conclua seu cadastro antes de publicar uma doação.");
  const owner = profile.data.id_usuario;
  if (!data.id) {
    if (data.values.status !== "Disponivel") throw new Error("Novas doações devem estar disponíveis.");
    const result = await context.supabase.from("DOACAO").insert({ ...data.values, id_usuario_doador: owner }).select("*").single();
    if (result.error) throw new Error("Não foi possível publicar a doação. Confira os dados e as permissões da sua conta.");
    return result.data;
  }
  const current = await context.supabase.from("DOACAO").select("*").eq("id_doacao", data.id).eq("id_usuario_doador", owner).single();
  if (current.error || !current.data) throw new Error("Doação não encontrada ou sem permissão para editar.");
  assertOwner(current.data, owner); assertStatusChange(current.data.status, data.values.status);
  const result = await context.supabase.from("DOACAO").update({ ...data.values, atualizado_em: new Date().toISOString() }).eq("id_doacao", data.id).eq("id_usuario_doador", owner).eq("status", current.data.status).select("*").maybeSingle();
  if (result.error || !result.data) throw new Error("Não foi possível salvar. A doação pode ter mudado; atualize a página e tente novamente.");
  return result.data;
});
export const removeDonation = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.number().int().positive(), mode: z.enum(["inactivate", "delete"]) })).handler(async ({ context, data }) => {
  const profile = await context.supabase.from("USUARIO").select("id_usuario").eq("auth_id", context.userId).single();
  if (profile.error || !profile.data) throw new Error("Não foi possível identificar seu cadastro.");
  const owner = profile.data.id_usuario;
  const current = await context.supabase.from("DOACAO").select("*").eq("id_doacao", data.id).eq("id_usuario_doador", owner).single();
  if (current.error || !current.data) throw new Error("Doação não encontrada ou sem permissão para remover.");
  assertOwner(current.data, owner); assertStatusChange(current.data.status, "Inativo");
  if (data.mode === "delete") {
    const removed = await context.supabase.from("DOACAO").delete().eq("id_doacao", data.id).eq("id_usuario_doador", owner).eq("status", current.data.status).select("id_doacao").maybeSingle();
    if (!removed.error) { if (!removed.data) throw new Error("A doação mudou. Atualize a página antes de remover."); return { status: "deleted" as const }; }
    // The existing foreign key, not a privileged history read, protects every related reservation.
    if (removed.error.code !== "23503") throw new Error("Não foi possível excluir a doação. Verifique as permissões e tente novamente.");
  }
  const result = await context.supabase.from("DOACAO").update({ status: "Inativo", atualizado_em: new Date().toISOString() }).eq("id_doacao", data.id).eq("id_usuario_doador", owner).eq("status", current.data.status).select("id_doacao").maybeSingle();
  if (result.error || !result.data) throw new Error("Não foi possível inativar a doação. Atualize a página e tente novamente.");
  return { status: "inactive" as const };
});
