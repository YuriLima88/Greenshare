import { Link, useNavigate } from "@tanstack/react-router";
import { Leaf, LogOut, Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { logoutUser } from "@/lib/auth";

const nav = [
  { to: "/", label: "Início" },
  { to: "/doacoes", label: "Doações" },
  { to: "/doacoes/nova", label: "Doar alimento" },
  { to: "/minha-conta", label: "Minha área" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-primary">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-leaf text-primary-foreground">
        <Leaf className="h-5 w-5" aria-hidden />
      </span>
      GreenShare
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const { user, loading, setUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    setLeaving(true);
    try {
      await logoutUser(queryClient);
      setUser(null);
      setOpen(false);
      await navigate({ to: "/entrar", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível sair.");
    } finally { setLeaving(false); }
  }
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground data-[status=active]:bg-secondary data-[status=active]:text-secondary-foreground"
            >
              {n.label}
            </Link>
          ))}
          {user ? <Button variant="outline" className="ml-2 rounded-full" onClick={signOut} disabled={leaving}><LogOut />{leaving ? "Saindo…" : "Sair"}</Button> : !loading && <Button asChild className="ml-2 rounded-full">
            <Link to="/entrar">Entrar</Link>
          </Button>}
        </nav>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <Menu />
        </Button>
      </div>
      {open && (
        <nav aria-label="Menu móvel" className="flex flex-col gap-1 border-t px-4 py-3 md:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary">
              {n.label}
            </Link>
          ))}
          {user ? <Button variant="ghost" className="justify-start" onClick={signOut} disabled={leaving}><LogOut />{leaving ? "Saindo…" : "Sair"}</Button> : !loading && <Link to="/entrar" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-semibold text-primary">
            Entrar / Cadastrar
          </Link>}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t bg-secondary/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <Logo />
        <p>Plataforma comunitária de doação e reaproveitamento de alimentos · contra o desperdício.</p>
      </div>
    </footer>
  );
}

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 pb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-semibold md:text-5xl">{title}</h1>
          {description && <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-secondary text-primary">{icon}</div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export const CATEGORIAS = ["Frutas", "Verduras e legumes", "Grãos e cereais", "Padaria", "Laticínios", "Refeições prontas", "Enlatados", "Outros"];
export const STATUS = [
  { value: "disponivel", label: "Disponível", className: "bg-status-available" },
  { value: "reservado", label: "Reservado", className: "bg-status-reserved" },
  { value: "entregue", label: "Entregue", className: "bg-status-delivered" },
] as const;
