<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Authentication uses a single root-mounted provider with Supabase Auth and validated user hydration; navigation reads that provider so identity transitions update every screen consistently.
- Signup sends trigger-required profile fields directly in Auth metadata and retains nested pending profile data for compatibility; authenticated completion reads the verified user and checks for an existing trigger-created USUARIO row before inserting through RLS after email confirmation, preventing duplicates.
- Doador/Receptor/Ambos are participation preferences, never authorization roles; no access privileges may be derived from editable Auth metadata.
- Donation CRUD uses RLS-scoped authenticated server functions, deriving ownership from USUARIO.auth_id; public available reads use a publishable server client.
- Reservations use RLS-scoped server functions and database defaults for synchronized creation/24-hour expiration; existing unique index, triggers and scheduled expiration own status changes, because application writes must not duplicate them.
- Reservation date validation uses America/Sao_Paulo for food validity days; server handlers recheck availability and ownership before insert to keep browser state untrusted.
- Recipient reservation lists use left-embedded donation details and retain IDs when donation RLS hides them; never bypass RLS to expose unavailable announcements.
- Donation deletion falls back to logical inactivation on existing foreign-key history; reserved status transitions are blocked and conditional writes detect concurrent status changes.
- Donation photos upload to the existing fotos-doacoes bucket under the authenticated UUID with unique paths; failed saves clean up newly uploaded files.
