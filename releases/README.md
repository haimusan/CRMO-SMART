# Release activation

`3348.json` is the current candidate manifest, not proof of publication. `3347.json` is retained as history. The private HTML stays outside this repository.

1. Preserve the current `admin/latest.json` and active artifact.
2. Upload the complete local `CRMO_v3348.html` to private bucket `admin`, path `releases/CRMO_v3348.html`. Never overwrite numbered editor history.
3. Download using the authenticated admin session and compare SHA-256, byte length, embedded versions and editor boot.
4. Replace `admin/latest.json` with the exact verified candidate manifest and verify it resolves to those bytes.
5. Merge the matching public code and wait for successful Pages deployment. Check both public URLs, admin version labels, title, gallery order and 16:9 project frames.
6. Complete a reversible local-file/cloud round trip before claiming synchronization.

If activation fails, restore the previous manifest and public commit as a pair. Never label an incomplete release as published.

3348 round trip verified on 2026-11-05: 573374 bytes, SHA-256 `1d4364b21a2fb91d7062f96a07e4ccdc3119cc6de30b392821e3b0de6fbc81f6`. Downloaded bytes booted locally and rendered cloud galleries without console errors. Authentication, 15 integrity/realtime/conflict tests and the private transformation gate passed using the actual 3348 editor. Manifest activation and live checks remain required.

Run `node scripts/prepare-release.cjs VERSION PRIVATE_EDITOR_PATH` to validate editor markers and inline scripts, calculate its manifest, and align the central config and entry cache versions. Keep public/admin display on the same `CRMO_CONFIG.contentRow` and revision; authentication changes editing capabilities only. Unsaved drafts must not publish automatically.

Client entry verifies the CRMO session before opening SPRINT DEV. The SPRINT server audience remains enforced: CRMO authentication alone does not create a Sites visitor grant.
