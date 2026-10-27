import { Suspense, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { BookmarkCheck, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "./site-layout";
import { listMyReservations, cancelReservation } from "@/lib/reservations.functions";
import { canCancelReservation, reservationStatus } from "@/lib/reservations";
import { formatDate } from "@/lib/donations";

export function MyReservations({ userId }: { userId: string }) {
  const cache = useQueryClient();
  return <ErrorBoundary resetKeys={[userId]} fallbackRender={({ error, resetErrorBoundary }) => <div className="space-y-4"><p role="alert">{error instanceof Error ? error.message : "Não foi possível consultar suas reservas."}</p><Button variant="outline" onClick={() => { void cache.resetQueries({ queryKey: ["reservations", "mine", userId] }); resetErrorBoundary(); }}>Tentar novamente</Button></div>}><Suspense fallback={<p role="status">Carregando suas reservas…</p>}><ReservationList userId={userId} /></Suspense></ErrorBoundary>;
}

function ReservationList({ userId }: { userId: string }) {
  const fetchMine = useServerFn(listMyReservations);
  const cancel = useServerFn(cancelReservation);
  const cache = useQueryClient();
  const { data } = useSuspenseQuery({ queryKey: ["reservations", "mine", userId], queryFn: () => fetchMine(), refetchInterval: 30_000 });
  const [now, setNow] = useState(() => new Date());
  const [target, setTarget] = useState<number | null>(null);
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 15_000); return () => clearInterval(timer); }, []);
  const mutation = useMutation({ mutationFn: cancel, onSuccess: async () => { setTarget(null); toast.success("Reserva cancelada."); await Promise.all([cache.invalidateQueries({ queryKey: ["reservations"] }), cache.invalidateQueries({ queryKey: ["donations"] })]); }, onError: e => toast.error(e.message) });

  return <>{data.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.map(r => <article key={r.id_reserva} className="space-y-4 rounded-lg border bg-card p-5 shadow-soft">
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="text-primary">Reserva #{r.id_reserva}</span><span className="text-muted-foreground">{reservationStatus(r, now)}</span></div>
    <h2 className="break-words text-xl font-semibold">{r.DOACAO?.titulo || `Doação #${r.id_doacao}`}</h2>
    <dl className="space-y-3 text-sm"><div><dt className="text-muted-foreground">Reservada em</dt><dd>{formatDate(r.data_reserva)}</dd></div><div><dt className="text-muted-foreground">Prazo da reserva</dt><dd>{formatDate(r.expira_em)}</dd></div>{r.DOACAO && <><div><dt className="text-muted-foreground">Local de retirada</dt><dd className="break-words">{r.DOACAO.local_retirada || "Não informado"}</dd></div><div><dt className="text-muted-foreground">Período de retirada</dt><dd>{formatDate(r.DOACAO.janela_retirada_inicio)} — {formatDate(r.DOACAO.janela_retirada_fim)}</dd></div></>}{r.data_retirada && <div><dt className="text-muted-foreground">Retirada em</dt><dd>{formatDate(r.data_retirada)}</dd></div>}</dl>
    {canCancelReservation(r, now) && <Button variant="outline" disabled={mutation.isPending} onClick={() => { mutation.reset(); setTarget(r.id_reserva); }}><X />Cancelar reserva</Button>}
  </article>)}</div> : <EmptyState icon={<BookmarkCheck />} title="Nenhuma reserva ainda" description="Suas reservas aparecerão aqui." action={<Button asChild variant="outline" className="rounded-full"><Link to="/doacoes">Explorar doações</Link></Button>} />}
  <Dialog open={target !== null} onOpenChange={open => { if (!open && !mutation.isPending) setTarget(null); }}><DialogContent><DialogHeader><DialogTitle>Cancelar reserva?</DialogTitle></DialogHeader><p>A reserva será cancelada e permanecerá no seu histórico.</p>{mutation.error && <p role="alert" className="text-sm text-destructive">{mutation.error.message}</p>}<div className="flex flex-wrap justify-end gap-2"><Button variant="outline" disabled={mutation.isPending} onClick={() => setTarget(null)}>Manter reserva</Button><Button disabled={mutation.isPending} onClick={() => { if (target !== null) mutation.mutate({ data: target }); }}>{mutation.isPending ? "Cancelando…" : "Confirmar cancelamento"}</Button></div></DialogContent></Dialog>
  </>;
}