# Release activation

`3347.json` is a candidate manifest, not proof of publication. The private HTML stays outside this repository.

1. Preserve the current `admin/latest.json` and active artifact.
2. Upload the complete local `CRMO_v3347.html` to private bucket `admin`, path `releases/CRMO_v3347.html`.
3. Download using the authenticated admin session and compare SHA-256, byte length, embedded versions and editor boot.
4. Replace `admin/latest.json` with the exact verified candidate manifest and verify it resolves to those bytes.
5. Merge the matching public code and wait for successful Pages deployment. Check both public URLs, admin version labels, title, gallery order and 16:9 project frames.
6. Complete a reversible local-file/cloud round trip before claiming synchronization.

If activation fails, restore the previous manifest and public commit as a pair. Never label an incomplete release as published.

Current blocker (2026-11-04): browser file transfer timed out; Storage has no 3347 artifact. Public main remains 3342. Six release-integrity cases and the private editor transformation/syntax gate pass. Full fixture-dependent legacy tests require their authorized private fixtures.
