# Authentication integration

## Reservation integration
- [x] Add authenticated reservation creation, own listing and cancellation using existing database rules.
- [x] Connect detail reserve action and Minhas reservas, validate date and ownership rules, preserve existing announcements.
- [x] Run automated tests and verify preview compilation and public pages: build OK, 39 tests pass, real old pickup-window rejection verified without modifying the announcement.
- [ ] Verify real authenticated reserve/cancel with future-dated announcements: external unmanaged Supabase prevents managed authenticated testing.

## Donation integration
- [x] Correct donation search/link compilation and verify preview pages without changing CRUD or Supabase; build OK.
- [x] Implement real available listings, search, category filters and detail reads.
- [x] Implement authenticated create/edit, existing photo storage and owner donation list.
- [x] Implement safe owner inactivation/deletion without modifying database rules.
- [x] Run automated tests and verify public flows; 22 tests pass, available listing, real donation detail and search verified.
- [ ] Verify create/edit/delete with a real authenticated account: authenticated end-to-end checks unavailable on external unmanaged Supabase; outside this compilation-only stage.

- [x] Correct signup metadata for the existing trigger; 18 tests pass and browser checks verify confirmation and error handling with simulated responses, without changing Supabase.
- [x] Implement login, session-aware navigation and logout using existing Supabase Auth.
- [x] Prepare signup fields and safe blocked state without creating incomplete Auth accounts.
- [x] Implement profile completion with confirmed email, authenticated UUID and existing INSERT policy; preserve all database rules. Automated tests pass; real-account verification remains below.
- [x] Verify eight tests, live invalid-login handling, profile choices, signed-out area and public hosted email Auth settings (email enabled, confirmation required); preview builds successfully.
- [ ] Verify successful login, refresh and logout with an existing real account: authenticated end-to-end testing unavailable for this external unmanaged Supabase project.