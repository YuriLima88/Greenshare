import { createFileRoute, Link, type SearchSchemaInput } from "@tanstack/react-router";
import { HandHeart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, PageHeader, STATUS } from "@/components/site-layout";
import { MyDonations } from "@/components/my-donations";
import { useAuth } from "@/components/auth-provider";
import { MyReservations } from "@/components/my-reservations";

export const Route = createFileRoute("/minha-conta")({
  validateSearch: (search: { tab?: unknown } & SearchSchemaInput): { tab?: "reservas" } => search.tab === "reservas" ? { tab: "reservas" } : {},
  head: () => ({
    meta: [
      { title: "Minha área — GreenShare" },
      { name: "description", content: "Gerencie suas doações, reservas e o status dos seus anúncios." },
      { property: "og:title", content: "Minha área — GreenShare" },
      { property: "og:description", content: "Gerencie suas doações e reservas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MinhaConta,
});

function MinhaConta() {
  const { user, loading, profileError, profileBusy, retryProfile } = useAuth();
  const { tab } = Route.useSearch();
  if (loading) return <div className="mx-auto max-w-6xl px-4 py-12"><p role="status">Verificando sua conta…</p></div>;
  if (!user) return <><PageHeader title="Minha área" /><div className="mx-auto max-w-6xl px-4"><EmptyState icon={<HandHeart />} title="Acesse sua conta" description="Entre para acompanhar sua participação no GreenShare." action={<Button asChild className="rounded-full"><Link to="/entrar">Entrar</Link></Button>} /></div></>;
  return (
    <>
      <PageHeader title="Minha área" description="Acompanhe seus anúncios e reservas, edite doações e atualize o status.">
        <Button asChild className="rounded-full"><Link to="/doacoes/nova"><Plus /> Nova doação</Link></Button>
      </PageHeader>
      <div className="mx-auto max-w-6xl px-4">
        <p className="mb-6 break-words text-sm text-muted-foreground">Conectado como {user.email}</p>
        {profileBusy && <p role="status" className="mb-6 text-sm text-muted-foreground">Concluindo seu cadastro…</p>}
        {profileError && <div className="mb-6 space-y-3"><p role="alert" className="text-sm text-destructive">{profileError}</p><Button variant="outline" disabled={profileBusy} onClick={() => void retryProfile()}>Tentar concluir cadastro</Button></div>}
        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground" aria-label="Legenda de status">
          {STATUS.map((s) => <span key={s.value} className="inline-flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${s.className}`} />{s.label}</span>)}
        </div>
        <Tabs key={tab ?? "doacoes"} defaultValue={tab ?? "doacoes"}>
          <TabsList>
            <TabsTrigger value="doacoes">Minhas doações</TabsTrigger>
            <TabsTrigger value="reservas">Minhas reservas</TabsTrigger>
          </TabsList>
          <TabsContent value="doacoes" className="mt-6">
            <MyDonations userId={user.id} />
          </TabsContent>
          <TabsContent value="reservas" className="mt-6">
            <MyReservations userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
