import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, type ComponentProps } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/auth-provider";
import { loginUser, PERFIS, registerUser, type Perfil } from "@/lib/auth";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar ou cadastrar — GreenShare" },
      { name: "description", content: "Acesse sua conta GreenShare ou crie um cadastro gratuito." },
      { property: "og:title", content: "Entrar ou cadastrar — GreenShare" },
      { property: "og:description", content: "Acesse sua conta GreenShare." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Entrar,
});

function Field({ id, label, ...p }: { id: string; label: string } & ComponentProps<"input">) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} {...p} />
    </div>
  );
}

function Entrar() {
  const { user, loading, setUser, profileError, profileBusy, retryProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const navigate = useNavigate();
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      setUser(await loginUser(String(form.get("email") ?? ""), String(form.get("senha") ?? "")));
      await navigate({ to: "/minha-conta", replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Não foi possível entrar. Tente novamente.");
    } finally { setBusy(false); }
  }
  async function signup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const result = await registerUser({ nome: String(form.get("nome") ?? ""), email: String(form.get("email-c") ?? ""), telefone: String(form.get("telefone") ?? ""), bairro: String(form.get("bairro") ?? ""), tipo_pessoa: form.get("tipo_pessoa") === "Jurídica" ? "Jurídica" : "Física", tipo_perfil: String(form.get("tipo_perfil")) as Perfil }, String(form.get("senha-c") ?? ""), window.location.origin);
      if (result.confirmationRequired) setConfirmation(true);
      else setUser(result.user);
    } catch (error) { setError(error instanceof Error ? error.message : "Não foi possível criar sua conta. Tente novamente."); }
    finally { setBusy(false); }
  }
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center text-4xl font-semibold">Bem-vindo ao GreenShare</h1>
      <p className="mt-2 text-center text-muted-foreground">Entre ou crie sua conta para doar e reservar.</p>
      {loading ? <p role="status" className="mt-8 text-center text-muted-foreground">Verificando sua conta…</p> : user ? <div className="mt-8 space-y-4 text-center"><p className="break-words text-muted-foreground">Você está conectado como {user.email}.</p>{profileBusy ? <p role="status">Concluindo seu cadastro…</p> : profileError ? <><p role="alert" className="text-sm text-destructive">{profileError}</p><Button onClick={() => void retryProfile()} variant="outline" className="rounded-full">Tentar concluir cadastro</Button></> : <><p role="status">Seu cadastro está pronto.</p><Button asChild className="rounded-full"><Link to="/minha-conta">Ir para minha área</Link></Button></>}</div> : confirmation ? <div className="mt-8 space-y-4 text-center"><h2 className="text-xl font-semibold">Confirme seu e-mail</h2><p role="status" className="text-muted-foreground">Confira sua caixa de entrada e a pasta de spam. Abra o link de confirmação e entre para concluir seu cadastro. Se já possui uma conta, use a opção Entrar.</p><Button variant="outline" className="rounded-full" onClick={() => setConfirmation(false)}>Voltar para entrar</Button></div> : <Tabs defaultValue="login" className="mt-8" onValueChange={() => setError("")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Entrar</TabsTrigger>
          <TabsTrigger value="cadastro">Cadastrar</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <form onSubmit={login} className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft" aria-busy={busy}>
            <Field id="email" label="E-mail" type="email" required autoComplete="email" disabled={busy} />
            <Field id="senha" label="Senha" type="password" required autoComplete="current-password" disabled={busy} />
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={busy} className="w-full rounded-full">{busy && <LoaderCircle className="animate-spin motion-reduce:animate-none" />}{busy ? "Entrando…" : "Entrar"}</Button>
          </form>
        </TabsContent>
        <TabsContent value="cadastro">
          <form onSubmit={signup} className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft" aria-busy={busy}>
            <fieldset disabled={busy} className="space-y-4">
            <Field id="nome" label="Nome completo" required autoComplete="name" />
            <Field id="email-c" label="E-mail" type="email" required autoComplete="email" />
            <Field id="telefone" label="Telefone (opcional)" type="tel" autoComplete="tel" />
            <Field id="bairro" label="Bairro (opcional)" autoComplete="address-level3" />
            <div className="space-y-1.5"><Label htmlFor="tipo-pessoa">Tipo de pessoa</Label><Select name="tipo_pessoa" required defaultValue="Física"><SelectTrigger id="tipo-pessoa"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Física">Pessoa física</SelectItem><SelectItem value="Jurídica">Pessoa jurídica</SelectItem></SelectContent></Select></div>
            <div className="space-y-1.5"><Label htmlFor="tipo-perfil">Perfil</Label><Select name="tipo_perfil" required><SelectTrigger id="tipo-perfil"><SelectValue placeholder="Selecione seu perfil" /></SelectTrigger><SelectContent>{PERFIS.map((perfil) => <SelectItem key={perfil} value={perfil}>{perfil}</SelectItem>)}</SelectContent></Select></div>
            <Field id="senha-c" label="Senha" type="password" required minLength={6} autoComplete="new-password" />
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={busy} className="w-full rounded-full">{busy && <LoaderCircle className="animate-spin motion-reduce:animate-none" />}{busy ? "Criando conta…" : "Criar conta"}</Button>
            </fieldset>
          </form>
        </TabsContent>
      </Tabs>}
    </div>
  );
}
