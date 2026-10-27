import { createFileRoute, Link } from "@tanstack/react-router";
import { HandHeart, PackageSearch, Recycle, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GreenShare — Compartilhe alimentos, reduza o desperdício" },
      { name: "description", content: "O GreenShare conecta quem tem alimentos excedentes a quem deseja recebê-los gratuitamente, combatendo o desperdício." },
      { property: "og:title", content: "GreenShare — Compartilhe alimentos" },
      { property: "og:description", content: "Doação gratuita de alimentos excedentes para reduzir o desperdício." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const passos = [
  { icon: Sprout, t: "Cadastre-se", d: "Crie sua conta gratuita em poucos segundos." },
  { icon: HandHeart, t: "Anuncie ou reserve", d: "Publique alimentos excedentes ou reserve uma doação disponível." },
  { icon: Recycle, t: "Retire e compartilhe", d: "Combine a retirada no período informado e evite o desperdício." },
];

function Index() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 md:grid-cols-2 md:pt-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
            <Sprout className="h-3.5 w-3.5" aria-hidden /> Plataforma comunitária de alimentos
          </span>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] md:text-6xl">
            Alimento bom <em className="text-primary">não</em> vai para o lixo.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            O GreenShare conecta pessoas com alimentos excedentes a quem deseja recebê-los gratuitamente — fortalecendo a comunidade e reduzindo o desperdício.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/doacoes"><PackageSearch /> Ver doações</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link to="/doacoes/nova">Quero doar</Link>
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-secondary" aria-hidden />
          <img src={hero} alt="Mãos compartilhando uma cesta com frutas, verduras e pão" width={1280} height={960} className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-soft" />
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4" aria-labelledby="como">
        <h2 id="como" className="text-3xl font-semibold md:text-4xl">Como funciona</h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {passos.map((p, i) => (
            <li key={p.t} className="rounded-2xl border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <p.icon className="h-8 w-8 text-primary" aria-hidden />
                <span className="font-display text-4xl text-border">0{i + 1}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold">{p.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4">
        <div className="rounded-3xl bg-leaf px-8 py-12 text-primary-foreground md:px-14">
          <h2 className="max-w-xl text-3xl font-semibold md:text-4xl">Tem alimentos sobrando em casa ou no seu negócio?</h2>
          <p className="mt-3 max-w-xl opacity-90">Transforme excedentes em ajuda para alguém da sua comunidade.</p>
          <Button asChild size="lg" variant="secondary" className="mt-6 rounded-full">
            <Link to="/entrar">Criar conta gratuita</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
