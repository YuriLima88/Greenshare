import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIAS } from "@/components/site-layout";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/integrations/supabase/client";
import { saveDonation } from "@/lib/donations.functions";
import { donationSchema, localDateTime, UNIDADES, type Donation, type DonationInput } from "@/lib/donations";

export function DoacaoForm({ donation, onSaved, submitLabel = "Publicar doação" }: { donation?: Donation; onSaved?: () => void; submitLabel?: string }) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(donation?.foto_url ?? "");
  const [categoria, setCategoria] = useState(donation?.categoria ?? "");
  const [unidade, setUnidade] = useState(donation?.unidade_medida ?? "");
  const [status, setStatus] = useState(donation?.status ?? "Disponivel");
  const [error, setError] = useState("");
  const save = useServerFn(saveDonation);
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const mutation = useMutation({
    mutationFn: async (values: DonationInput) => {
      if (!user) throw new Error("Entre na sua conta para publicar uma doação.");
      let uploaded: string | null = null;
      if (file) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Envie uma foto JPG, PNG ou WebP.");
        const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
        uploaded = `${user.id}/${crypto.randomUUID()}.${extension}`;
        const result = await supabase.storage.from("fotos-doacoes").upload(uploaded, file, { contentType: file.type, upsert: false });
        if (result.error) throw new Error("Não foi possível enviar a foto. Verifique o arquivo e tente novamente.");
        values = { ...values, foto_url: supabase.storage.from("fotos-doacoes").getPublicUrl(uploaded).data.publicUrl };
      }
      try { return await save({ data: { id: donation?.id_doacao, values } }); }
      catch (e) { if (uploaded) await supabase.storage.from("fotos-doacoes").remove([uploaded]); throw e; }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["donations"] });
      toast.success(donation ? "Doação atualizada com sucesso." : "Doação publicada com sucesso.");
      onSaved?.();
    },
    onError: (e) => { const message = e instanceof Error ? e.message : "Não foi possível salvar a doação."; setError(message); toast.error(message); },
  });
  return <form onSubmit={e => {
    e.preventDefault(); setError("");
    const form = new FormData(e.currentTarget);
    const start = String(form.get("inicio") ?? ""); const end = String(form.get("fim") ?? "");
    const startDate = new Date(start); const endDate = new Date(end);
    if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime())) { setError("Informe um período de retirada válido."); return; }
    const parsed = donationSchema.safeParse({ titulo: form.get("titulo"), descricao: form.get("descricao"), categoria, quantidade: Number(form.get("quantidade")), unidade_medida: unidade, data_validade: form.get("validade") || null, local_retirada: form.get("local") || null, janela_retirada_inicio: startDate.toISOString(), janela_retirada_fim: endDate.toISOString(), foto_url: donation?.foto_url ?? null, status });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Confira os campos."); return; }
    mutation.mutate(parsed.data);
  }} className="grid gap-6 rounded-2xl border bg-card p-6 shadow-soft md:grid-cols-[280px_1fr] md:p-8">
    <div><Label htmlFor="foto">Foto</Label><label htmlFor="foto" className="mt-1.5 grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-xl border-2 border-dashed bg-muted text-center text-sm text-muted-foreground hover:border-primary">{preview ? <img src={preview} alt="Pré-visualização da foto" className="h-full w-full object-cover" /> : <span className="flex flex-col items-center gap-2"><ImagePlus className="h-8 w-8" />Clique para enviar</span>}</label><input id="foto" type="file" accept="image/jpeg,image/png,image/webp" disabled={mutation.isPending} className="sr-only" onChange={e => setFile(e.target.files?.[0] ?? null)} /></div>
    <fieldset disabled={mutation.isPending} className="grid min-w-0 gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="titulo">Título</Label><Input id="titulo" name="titulo" defaultValue={donation?.titulo} required placeholder="Ex.: Cesta de legumes" /></div>
      <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="descricao">Descrição</Label><Textarea id="descricao" name="descricao" defaultValue={donation?.descricao} required rows={4} placeholder="Estado de conservação, origem, observações…" /></div>
      <div className="space-y-1.5"><Label htmlFor="categoria">Categoria</Label><Select required value={categoria} onValueChange={setCategoria}><SelectTrigger id="categoria"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-1.5"><Label htmlFor="quantidade">Quantidade</Label><Input id="quantidade" name="quantidade" defaultValue={donation?.quantidade} type="number" min="0" step="any" inputMode="decimal" required placeholder="Ex.: 3.5" /></div>
      <div className="space-y-1.5"><Label htmlFor="unidade">Unidade de medida</Label><Select required value={unidade} onValueChange={setUnidade}><SelectTrigger id="unidade"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{UNIDADES.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-1.5"><Label htmlFor="validade">Validade</Label><Input id="validade" name="validade" type="date" defaultValue={donation?.data_validade ?? ""} /></div>
      <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="local">Local de retirada</Label><Input id="local" name="local" defaultValue={donation?.local_retirada ?? ""} placeholder="Bairro ou ponto de referência" /></div>
      <div className="space-y-1.5"><Label htmlFor="ret-ini">Retirada a partir de</Label><Input id="ret-ini" name="inicio" type="datetime-local" defaultValue={localDateTime(donation?.janela_retirada_inicio)} required /></div>
      <div className="space-y-1.5"><Label htmlFor="ret-fim">Retirada até</Label><Input id="ret-fim" name="fim" type="datetime-local" defaultValue={localDateTime(donation?.janela_retirada_fim)} required /></div>
      {donation && <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="status">Status</Label><Select value={status} onValueChange={setStatus} disabled={donation.status === "Reservado"}><SelectTrigger id="status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Disponivel">Disponível</SelectItem>{donation.status === "Reservado" && <SelectItem value="Reservado">Reservado</SelectItem>}<SelectItem value="Entregue">Entregue</SelectItem><SelectItem value="Inativo">Inativo</SelectItem></SelectContent></Select></div>}
      {error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{error}</p>}
      <Button type="submit" size="lg" disabled={mutation.isPending} className="rounded-full sm:col-span-2 sm:justify-self-end">{mutation.isPending ? "Salvando…" : submitLabel}</Button>
    </fieldset>
  </form>;
}
