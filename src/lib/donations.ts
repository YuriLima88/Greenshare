import { z } from "zod";
import type { Tables } from "@/integrations/supabase/types";
export type Donation = Tables<"DOACAO">;
export const UNIDADES = ["kg", "g", "unidades", "litros"] as const;
export const donationSchema = z.object({
  titulo: z.string().trim().min(1, "Informe o título."),
  descricao: z.string().trim().min(1, "Informe a descrição."),
  categoria: z.string().trim().min(1, "Selecione a categoria."),
  quantidade: z.number().finite().positive("Informe uma quantidade maior que zero."),
  unidade_medida: z.enum(UNIDADES),
  data_validade: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  local_retirada: z.string().trim().nullable(),
  janela_retirada_inicio: z.string().datetime({ offset: true }),
  janela_retirada_fim: z.string().datetime({ offset: true }),
  foto_url: z.string().url().refine(v => v.startsWith("https://"), "Use uma foto com endereço HTTPS.").nullable(),
  status: z.enum(["Disponivel", "Reservado", "Entregue", "Inativo"]),
}).refine(v => Date.parse(v.janela_retirada_fim) > Date.parse(v.janela_retirada_inicio), { message: "O fim da retirada deve ser posterior ao início.", path: ["janela_retirada_fim"] });
export type DonationInput = z.infer<typeof donationSchema>;
export function assertOwner(donation: Donation, ownerId: number) {
  if (donation.id_usuario_doador !== ownerId) throw new Error("Você só pode alterar suas próprias doações.");
}
export function assertStatusChange(current: string, next: string) {
  if (current === "Reservado" && next !== current) throw new Error("Esta doação está reservada. Resolva a reserva antes de alterar o status ou remover o anúncio.");
  if (current !== "Reservado" && next === "Reservado") throw new Error("O status Reservado é definido por uma reserva.");
}
export function statusLabel(status: string) { return status === "Disponivel" ? "Disponível" : status; }
export function localDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0,16);
}
export function formatDate(value: string) { return new Date(value.length === 10 ? `${value}T12:00:00` : value).toLocaleString("pt-BR", value.length === 10 ? { dateStyle: "short" } : { dateStyle: "short", timeStyle: "short" }); }
