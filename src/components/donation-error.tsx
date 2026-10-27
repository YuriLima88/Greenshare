import { useRouter } from "@tanstack/react-router";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
export function DonationError({ error }: { error: unknown }) {
 const router = useRouter(); const boundary = useQueryErrorResetBoundary();
 return <div className="mx-auto max-w-6xl space-y-4 px-4 py-12"><p role="alert">{error instanceof Error ? error.message : "Não foi possível carregar as doações."}</p><Button variant="outline" onClick={() => { boundary.reset(); void router.invalidate(); }}>Tentar novamente</Button></div>;
}
