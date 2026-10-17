# CRMO 3285 — review branch

Public `index.html` loads only the display renderer. `admin/index.html` retains the 3284 editing system with a server-role gate. Display code is extracted from the approved renderer rather than replaced with a redesign.

Both file:// and HTTPS use `public/config.js`, the same Supabase preview row, the same asset resolver. Preview writes target `preview_v3285` and `preview_v3285__multi_gallery_demo`, never the live `main` rows. Existing media URLs remain valid; no media has been relocated or deleted.

## Prepared, not yet activated

`database/activate-roles.sql` defines the six intended roles and own-role reads, editor-only content INSERT/UPDATE, public media reads, private admin media reads, and editor-only media INSERT/UPDATE. It removes the legacy broad storage policies; it does not grant DELETE access. Owner assignments must be provisioned separately using the two accounts explicitly confirmed by the owner in the setup conversation. No emails, user IDs, passwords, sessions or service-role keys are committed.

Automatic approval review rejected the initial production policy bundle. The revised SQL is staged for review only; role/storage schema and policy changes have NOT been applied. Until activation, admin fails closed and cannot edit even for the owner. Existing production policies remain in effect and still need to be corrected. Preview content copies were created separately.

## Completed backups

Git branch `backup/pre-3285-2026-10-17` retains the live 3268 source commit. Supabase `crmo_private.release_backups`, release `pre_3285_20261017`, holds all five original config rows, original policies, bucket metadata and metadata for 286 objects. This is a metadata/content snapshot, not an independent binary backup of the image objects. Existing media objects remain untouched. The private backup schema has no grants to anonymous/authenticated users and no RLS allow policy.

## Checks

Run `node tests/viewer.cjs /path/to/private-exported-payload.json` and `node tests/permissions.cjs` with Node 24. These run the actual extracted renderer in a DOM test harness and mock the role API. They cover file/HTTPS content parity (with an external local test fixture), all 17 galleries and 106 tile slots, exact order, read-only public network use, no editor DOM, role gating, user-metadata privilege escalation and failure-closed behavior.

All inline admin/public JavaScript is syntax checked. These checks are not a real-browser visual or authentication test. Real owner login, cloud upload/save/read-back, mobile/desktop visual comparison, brand lightboxes, expanded galleries and existing asset URLs still require browser verification after role activation. No production publishing has occurred.

## Local review

Keep the folder structure intact. Open `index.html` for display or `admin/index.html` for admin. Static hosting also works. Both runtimes read the preview row directly from Supabase. No full content export is committed to this public repository. The public viewer needs a network connection; when content cannot load it shows a retry message. Existing local admin drafts remain local. A public re-focus refresh does not write to the database. Admin changes require explicit saves and the original write/read-back verification flow.

The site is still on GitHub Pages. This branch does not create another hosting service. Since this is a public repository, admin source files can be downloaded: authorization is enforced by Supabase, not by a folder name. If source-code confidentiality is required as well as data authorization, admin must be hosted behind an authenticated server/private deployment in a later step.

## Rebuild

`node scripts/build.cjs /path/to/approved-3284.html`

The display test fixture is kept outside this repository. The builder uses Node's embedded parser and requires no downloaded packages. It strips all editor function implementations from the public renderer. Public data/config files include no secret keys. Keep full backup exports out of this public repository.

## Activation checklist

1. Review/apply the SQL, assign the two confirmed owners server-side, and verify anonymous/ordinary-user write denial and owner INSERT/UPDATE success in rollback-only database tests.
2. Supply the studio assets at `assets/studio/` in Supabase; the current live storage has no `studio/` objects. Existing local assets can be uploaded after the authenticated storage path is available. Preserve old URLs until copy/reference verification completes.
3. Perform real-browser tests listed above and compare 3284 with the separated viewer.
4. Review the preview changes, then promote config row keys and merge only after owner approval. Keep the backup branch and database snapshot for rollback.

No old bucket, row, image, user or project is deleted by this release.
