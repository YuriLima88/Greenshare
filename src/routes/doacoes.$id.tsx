import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ImageOff } from "lucide-react";
import { ReserveDonation } from "@/components/reserve-donation";
import { donationQuery } from "@/lib/donations.queries";
import { formatDate, statusLabel } from "@/lib/donations";
import { DonationError } from "@/components/donation-error";

export const Route = createFileRoute("/doacoes/$id")({
  loader: async ({ context, params }) => { const id = Number(params.id); if (!Number.isInteger(id) || id <= 0) throw notFound(); const d = await context.queryClient.ensureQueryData(donationQuery(id)); if (!d) throw notFound(); },
  errorComponent: DonationError,
  notFoundComponent: () => <div className="mx-auto max-w-6xl px-4 py-12"><h1 className="text-2xl">Doação indisponível</h1><Link to="/doacoes">Voltar às doações</Link></div>,
  head: () => ({
    meta: [
      { title: "Detalhes da doação — GreenShare" },
      { name: "description", content: "Veja os detalhes da doação e faça sua reserva." },
      { property: "og:title", content: "Detalhes da doação — GreenShare" },
      { property: "og:description", content: "Detalhes e reserva de uma doação de alimentos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Detalhe,
});

function Detalhe() {
 const { id } = Route.useParams(); const { data: d } = useSuspenseQuery(donationQuery(Number(id)));
 if (!d) return null;
 return <div className="mx-auto max-w-6xl px-4 py-10"><Link to="/doacoes" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" />Voltar às doações</Link><div className="mt-6 grid gap-10 md:grid-cols-2"><div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-3xl bg-muted text-muted-foreground">{d.foto_url ? <img src={d.foto_url} alt={d.titulo} className="h-full w-full object-cover" /> : <ImageOff className="h-10 w-10" aria-label="Sem foto" />}</div><div><p className="text-sm font-medium text-primary">{statusLabel(d.status)}</p><h1 className="mt-4 break-words text-4xl font-semibold">{d.titulo}</h1><p className="mt-4 whitespace-pre-wrap break-words text-muted-foreground">{d.descricao}</p><dl className="mt-6 grid gap-4 sm:grid-cols-2">{[["Categoria", d.categoria], ["Quantidade", `${d.quantidade.toLocaleString("pt-BR")} ${d.unidade_medida}`], ["Validade", d.data_validade ? formatDate(d.data_validade) : "Não informada"], ["Local de retirada", d.local_retirada || "Não informado"], ["Retirada a partir de", formatDate(d.janela_retirada_inicio)], ["Retirada até", formatDate(d.janela_retirada_fim)]].map(([label,value]) => <div key={label} className="min-w-0 rounded-lg border p-4"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="mt-2 break-words font-medium">{value}</dd></div>)}</dl><ReserveDonation donation={d} /></div></div></div>;
}
