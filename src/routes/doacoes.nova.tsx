import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site-layout";
import { useAuth } from "@/components/auth-provider";
import { DoacaoForm } from "@/components/donation-form";
export { UNIDADES } from "@/lib/donations";
export { DoacaoForm } from "@/components/donation-form";

export const Route = createFileRoute("/doacoes/nova")({
  head: () => ({
    meta: [
      { title: "Cadastrar doação — GreenShare" },
      { name: "description", content: "Anuncie alimentos excedentes para doação gratuita." },
      { property: "og:title", content: "Cadastrar doação — GreenShare" },
      { property: "og:description", content: "Anuncie alimentos excedentes no GreenShare." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NovaDoacao,
});

function NovaDoacao() {
 const { user, loading } = useAuth(); const navigate = useNavigate();
 return <><PageHeader title="Cadastrar doação" description="Informe os detalhes do alimento e o período em que ele pode ser retirado." /><div className="mx-auto max-w-6xl px-4">{loading ? <p role="status">Verificando sua conta…</p> : user ? <DoacaoForm onSaved={() => void navigate({ to: "/minha-conta" })} /> : <div className="space-y-4"><p>Entre para cadastrar uma doação.</p><Button asChild className="rounded-full"><Link to="/entrar">Entrar</Link></Button></div>}</div></>;
}
