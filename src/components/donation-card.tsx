import { Link } from "@tanstack/react-router";
import { ImageOff, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { statusLabel, type Donation } from "@/lib/donations";
export function DonationCard({ donation: d, children }: { donation: Donation; children?: ReactNode }) {
  return <article className="overflow-hidden rounded-lg border bg-card shadow-soft">
    <div className="grid aspect-[4/3] place-items-center overflow-hidden bg-muted text-muted-foreground">{d.foto_url ? <img src={d.foto_url} alt={d.titulo} loading="lazy" className="h-full w-full object-cover" /> : <ImageOff className="h-10 w-10" aria-label="Sem foto" />}</div>
    <div className="space-y-3 p-5"><div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="text-primary">{d.categoria}</span><span className="text-muted-foreground">{statusLabel(d.status)}</span></div><h2 className="break-words text-xl font-semibold">{children ? d.titulo : <Link to="/doacoes/$id" params={{ id: String(d.id_doacao) }} className="hover:text-primary">{d.titulo}</Link>}</h2><p className="line-clamp-3 break-words text-sm text-muted-foreground">{d.descricao}</p><p className="font-medium">{d.quantidade.toLocaleString("pt-BR")} {d.unidade_medida}</p>{d.local_retirada && <p className="flex items-start gap-2 break-words text-sm text-muted-foreground"><MapPin className="h-4 w-4 shrink-0" />{d.local_retirada}</p>}{children}</div>
  </article>;
}
