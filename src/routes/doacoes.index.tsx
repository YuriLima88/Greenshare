import { createFileRoute, Link, useNavigate, type SearchSchemaInput } from "@tanstack/react-router";
import { PackageOpen, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIAS, EmptyState, PageHeader } from "@/components/site-layout";

import { useSuspenseQuery } from "@tanstack/react-query";
import { donationsQuery } from "@/lib/donations.queries";
import { DonationCard } from "@/components/donation-card";
import { DonationError } from "@/components/donation-error";

export const Route = createFileRoute("/doacoes/")({
  validateSearch: (search: { q?: unknown; categoria?: unknown; page?: unknown } & SearchSchemaInput) => ({ q: typeof search.q === "string" ? search.q.slice(0, 200) : "", categoria: typeof search.categoria === "string" && CATEGORIAS.includes(search.categoria) ? search.categoria : "", page: Math.max(1, Math.floor(Number(search.page) || 1)) }),
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => { await context.queryClient.ensureQueryData(donationsQuery(deps)); },
  errorComponent: DonationError,
  notFoundComponent: () => <p>Doações não encontradas.</p>,
  head: () => ({
    meta: [
      { title: "Doações disponíveis — GreenShare" },
      { name: "description", content: "Encontre alimentos disponíveis para doação gratuita perto de você." },
      { property: "og:title", content: "Doações disponíveis — GreenShare" },
      { property: "og:description", content: "Alimentos disponíveis para doação gratuita." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Doacoes,
});

function Doacoes() {
  const search = Route.useSearch(); const navigate = useNavigate({ from: Route.fullPath });
  const { data } = useSuspenseQuery(donationsQuery(search));
  return (
    <>
      <PageHeader title="Doações disponíveis" description="Alimentos compartilhados pela comunidade, prontos para uma nova mesa.">
        <Button asChild className="rounded-full"><Link to="/doacoes/nova"><Plus /> Nova doação</Link></Button>
      </PageHeader>
      <div className="mx-auto max-w-6xl px-4">
        <div role="search" className="mb-8 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={search.q} onChange={e => void navigate({ search: prev => ({ ...prev, q: e.target.value, page: 1 }), replace: true })} aria-label="Buscar doações" placeholder="Buscar por título ou descrição" className="pl-9" />
          </div>
          <Select value={search.categoria || "all"} onValueChange={value => void navigate({ search: prev => ({ ...prev, categoria: value === "all" ? "" : value, page: 1 }) })}>
            <SelectTrigger className="sm:w-56" aria-label="Filtrar por categoria"><SelectValue placeholder="Todas as categorias" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todas as categorias</SelectItem>{CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {data.rows.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.rows.map(d => <DonationCard key={d.id_doacao} donation={d} />)}</div> : <EmptyState icon={<PackageOpen />} title="Nenhuma doação para exibir" description={search.q || search.categoria ? "Nenhum anúncio corresponde à sua busca." : "As doações compartilhadas pela comunidade aparecerão aqui."} action={<Button asChild variant="outline" className="rounded-full"><Link to="/doacoes/nova">Cadastrar doação</Link></Button>} />}
        {data.count > 12 && <div className="mt-8 flex items-center justify-center gap-4"><Button variant="outline" disabled={search.page <= 1} onClick={() => void navigate({ search: prev => ({ ...prev, page: prev.page - 1 }) })}>Anterior</Button><span>Página {search.page} de {Math.ceil(data.count / 12)}</span><Button variant="outline" disabled={search.page * 12 >= data.count} onClick={() => void navigate({ search: prev => ({ ...prev, page: prev.page + 1 }) })}>Próxima</Button></div>}
      </div>
    </>
  );
}
