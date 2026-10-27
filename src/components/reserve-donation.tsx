import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth-provider";
import { createReservation } from "@/lib/reservations.functions";
import { reservationUnavailable } from "@/lib/reservations";
import type { Donation } from "@/lib/donations";

export function ReserveDonation({ donation }: { donation: Donation }) {
  const { user, loading, profileBusy, profileError } = useAuth();
  const reserve = useServerFn(createReservation);
  const navigate = useNavigate();
  const cache = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const unavailable = reservationUnavailable(donation);

  async function submit() {
    if (!user || busy) return;
    setBusy(true); setError("");
    try {
      await reserve({ data: donation.id_doacao });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Não foi possível reservar. Tente novamente.";
      setError(message); toast.error(message); setBusy(false); return;
    }
    toast.success("Doação reservada. Acompanhe sua reserva em Minha área.");
    await navigate({ to: "/minha-conta", search: { tab: "reservas" } });
    await Promise.all([cache.invalidateQueries({ queryKey: ["reservations"] }), cache.invalidateQueries({ queryKey: ["donations"] })]);
  }

  return <div className="mt-8 space-y-3">
    {unavailable ? <p role="status" className="text-sm text-muted-foreground">{unavailable}</p> : null}
    {!loading && !user && !unavailable ? <Button asChild size="lg" className="w-full rounded-full"><Link to="/entrar"><BookmarkCheck />Entrar para reservar</Link></Button> : <Button size="lg" className="w-full rounded-full" disabled={loading || busy || profileBusy || !!profileError || !!unavailable} onClick={() => void submit()}><BookmarkCheck />{busy ? "Reservando…" : "Reservar doação"}</Button>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}