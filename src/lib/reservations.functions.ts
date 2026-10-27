import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertReservable, canCancelReservation, reservationWriteError } from "./reservations";

const reservationId = z.number().int().positive();

export const createReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(reservationId)
  .handler(async ({ context, data }) => {
    const profile = await context.supabase.from("USUARIO").select("id_usuario").eq("auth_id", context.userId).single();
    if (profile.error || !profile.data) throw new Error("Conclua seu cadastro antes de reservar uma doação.");
    const donation = await context.supabase.from("DOACAO").select("*").eq("id_doacao", data).maybeSingle();
    if (donation.error || !donation.data) throw new Error("Esta doação não está disponível para reserva.");
    assertReservable(donation.data, profile.data.id_usuario);
    // Existing defaults use the SAME database clock: data_reserva = now(), expira_em = now() + 24 hours.
    // The unique active index and INSERT trigger own concurrency and donation status updates.
    const result = await context.supabase.from("RESERVA").insert({ id_doacao: data, id_usuario_receptor: profile.data.id_usuario, status_reserva: "Ativa" }).select("*").single();
    if (result.error || !result.data) throw new Error(reservationWriteError(result.error?.code));
    return result.data;
  });

export const listMyReservations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const profile = await context.supabase.from("USUARIO").select("id_usuario").eq("auth_id", context.userId).single();
    if (profile.error || !profile.data) throw new Error("Conclua seu cadastro antes de consultar suas reservas.");
    const rows = [];
    for (let offset = 0; ; offset += 500) {
      // A left embed preserves the reservation when DOACAO's existing RLS hides a reserved announcement from its recipient.
      const result = await context.supabase.from("RESERVA").select("*, DOACAO(titulo, local_retirada, janela_retirada_inicio, janela_retirada_fim)").eq("id_usuario_receptor", profile.data.id_usuario).order("data_reserva", { ascending: false }).order("id_reserva", { ascending: false }).range(offset, offset + 499);
      if (result.error) throw new Error("Não foi possível carregar suas reservas. Tente novamente.");
      rows.push(...result.data);
      if (result.data.length < 500) break;
    }
    return rows;
  });

export const cancelReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(reservationId)
  .handler(async ({ context, data }) => {
    const profile = await context.supabase.from("USUARIO").select("id_usuario").eq("auth_id", context.userId).single();
    if (profile.error || !profile.data) throw new Error("Não foi possível identificar seu cadastro.");
    const current = await context.supabase.from("RESERVA").select("*").eq("id_reserva", data).eq("id_usuario_receptor", profile.data.id_usuario).maybeSingle();
    if (current.error || !current.data) throw new Error("Reserva não encontrada ou sem permissão para cancelar.");
    if (!canCancelReservation(current.data)) throw new Error("Esta reserva não está mais ativa. Atualize a lista.");
    // Only change the allowed status; existing trigger releases DOACAO. Never delete reservation history.
    const result = await context.supabase.from("RESERVA").update({ status_reserva: "Cancelada" }).eq("id_reserva", data).eq("id_usuario_receptor", profile.data.id_usuario).eq("status_reserva", "Ativa").gt("expira_em", new Date().toISOString()).select("*").maybeSingle();
    if (result.error || !result.data) throw new Error("Não foi possível cancelar. A reserva pode ter mudado; atualize a lista e tente novamente.");
    return result.data;
  });