# CRMO release rules

- The browser title is always exactly `CRMO | sales oriented design`, for public and admin pages. Never put release numbers in it.
- Every published code update increments the numeric release by one.
- `public/config.js` (`CRMO_CONFIG.release`) is the single source for the displayed release. Do not hardcode a second release in the admin loader.
- The admin dashboard `#adminVersionPill` and footer labels `#footerVersionLabel`, `#crmo-footer-version`, `.crmo3047-footer-version` must all display the same current `CRMO_v<number>`.
- Private editor documents must receive the current central configuration when loaded. Legacy editor scripts must not restore stale title or version labels.
- Update config and loader cache query strings in both entry pages when releasing these files.
- Verify title and all version labels after initial load and after legacy scripts attempt to change them. Confirm the GitHub Pages deployment succeeds before reporting publication.

# Portfolio image framing rule

- Project images fill a landscape 16:9 frame, edge to edge. Never add white letterboxing, pillarboxing or a white presentation mat to force the aspect ratio.
- Use a visually reviewed crop when it preserves meaningful project information; otherwise complete only the surrounding background. Never stretch the image or change the designed project, product, branding or factual subject.
- A white background inherent in the original studio render is distinct from an added white border. Never infer an aggressive crop solely from the silhouette on white.
- Apply reviewed framing consistently to project tiles, lightbox images and thumbnail previews, on desktop and mobile.
- Before processing or uploading, compare existing project media and prepared assets. Reuse matching assets and avoid duplicate uploads or repeat processing.
- Preserve source assets and keep framing changes reversible.

# Content synchronization

- Site-wide navigation rule: header and mobile-menu links navigate to sections of the complete home page (`/#exhibitions`, for example). They do not open standalone galleries.
- External share links and the admin Copy Link action use the standalone gallery path (`/exhibitions/`, for example). Preserve this distinction in every gallery, including all POS children.
- A home-page hash stays internal. Removing `view=public` must not convert that hash into a standalone path.

- The current public viewer hydrates the legacy `payload.galleries` array before the structured `payload.tiles.items` representation. Updating only tiles.items does not update the public gallery.
- For every project addition, media reorder, caption change or visibility change, keep the matching legacy gallery tile (`overlay`, `meta`, `media`, `display`, `isVisible`) and structured tile (`title`, `shortDescription`, `files`, `filesMeta`, `visible`) synchronized.
- Verify the legacy gallery media count, order, caption and visibility as well as the structured record before reporting a publication. Scope updates to the requested projects and preserve unrelated content.

# Mandatory private release parity gate

- **Never mark a CRMO version as published or complete until both the public code and the private `admin` Storage release have been verified.** Public deployment alone is incomplete.
- The private artifact path is `admin/releases/CRMO_v<N>.html` (Supabase Storage bucket `admin`, private), with `admin/latest.json` pointing to exactly that path and version. The file must be a complete usable HTML editor, not merely a renamed older release.
- Before deployment: identify the current public release from `public/config.js`, select the next unused version, prepare the matching full editor, and retain the previous release. Do not increment a public version without a matching private artifact ready to upload.
- Release order: upload the complete HTML to the private bucket, download it with an admin-authenticated session and verify its hash, version and basic editor boot; update `latest.json` only after successful upload; verify the manifest resolves to the same file; then deploy/publicize the corresponding version. If any step fails, stop and report the release as blocked. Never silently publish only `index.html` or `config.js`.
- At the end of each release, confirm `public/config.js` version, public site version, private release filename, `latest.json` target, and actual content/structure parity. Include a local-file ↔ cloud round-trip test before claiming full multi-environment synchronization.
- Keep the private editor in a private bucket and never copy it into a public GitHub Pages path. Never commit secrets or service-role credentials to the repository.
- Do not confuse the file's external filename with its internal version markers. A renamed legacy file is not a new release; check the embedded version, sync protocol and behavior.
