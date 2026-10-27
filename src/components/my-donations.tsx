import { Suspense, useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ErrorBoundary } from "react-error-boundary";
import { Archive, Pencil, Trash2, HandHeart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/site-layout";
import { DonationCard } from "./donation-card";
import { DoacaoForm } from "./donation-form";
import { listMyDonations, removeDonation } from "@/lib/donations.functions";
import type { Donation } from "@/lib/donations";

export function MyDonations({ userId }: { userId: string }) {
 return <ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) => <div className="space-y-4"><p role="alert">{error instanceof Error ? error.message : "Não foi possível consultar suas doações."}</p><Button variant="outline" onClick={resetErrorBoundary}>Tentar novamente</Button></div>}><Suspense fallback={<p role="status">Carregando suas doações…</p>}><MyDonationList userId={userId} /></Suspense></ErrorBoundary>;
}
function MyDonationList({ userId }: { userId: string }) {
 const fetchMine = useServerFn(listMyDonations); const remove = useServerFn(removeDonation); const cache = useQueryClient();
 const { data } = useSuspenseQuery({ queryKey: ["donations", "mine", userId], queryFn: () => fetchMine() });
 const [edit, setEdit] = useState<Donation | null>(null);
 const [target, setTarget] = useState<{ donation: Donation; mode: "delete" | "inactivate" } | null>(null);
 const mutation = useMutation({ mutationFn: remove, onSuccess: async result => { await cache.invalidateQueries({ queryKey: ["donations"] }); setTarget(null); toast.success(result.status === "deleted" ? "Doação excluída." : "Doação inativada; seu histórico foi preservado."); }, onError: e => toast.error(e instanceof Error ? e.message : "Não foi possível remover a doação.") });
 return <>{data.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.map(d => <DonationCard key={d.id_doacao} donation={d}><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setEdit(d)}><Pencil />Editar</Button><Button variant="outline" disabled={d.status === "Reservado" || d.status === "Inativo"} onClick={() => setTarget({ donation: d, mode: "inactivate" })}><Archive />Inativar</Button><Button variant="ghost" disabled={d.status === "Reservado"} onClick={() => setTarget({ donation: d, mode: "delete" })}><Trash2 />Excluir</Button></div></DonationCard>)}</div> : <EmptyState icon={<HandHeart />} title="Você ainda não tem doações" description="Seus anúncios aparecerão aqui." />}
 <Dialog open={!!edit} onOpenChange={open => { if (!open) setEdit(null); }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-4xl"><DialogHeader><DialogTitle>Editar doação</DialogTitle></DialogHeader>{edit && <DoacaoForm key={edit.id_doacao} donation={edit} submitLabel="Salvar alterações" onSaved={() => setEdit(null)} />}</DialogContent></Dialog>
 <Dialog open={!!target} onOpenChange={open => { if (!open && !mutation.isPending) setTarget(null); }}><DialogContent><DialogHeader><DialogTitle>{target?.mode === "delete" ? "Excluir doação?" : "Inativar doação?"}</DialogTitle></DialogHeader><p className="break-words">{target?.donation.titulo}</p><p className="text-sm text-muted-foreground">{target?.mode === "delete" ? "A exclusão é permanente. Se houver reservas relacionadas, o anúncio será inativado e o histórico preservado." : "O anúncio sairá da lista de doações disponíveis, mantendo seu histórico."}</p>{mutation.error && <p role="alert" className="text-sm text-destructive">{mutation.error.message}</p>}<div className="flex justify-end gap-2"><Button variant="outline" disabled={mutation.isPending} onClick={() => setTarget(null)}>Cancelar</Button><Button disabled={mutation.isPending} onClick={() => { if (target) mutation.mutate({ data: { id: target.donation.id_doacao, mode: target.mode } }); }}>{mutation.isPending ? "Removendo…" : "Confirmar"}</Button></div></DialogContent></Dialog>
 </>;
}
