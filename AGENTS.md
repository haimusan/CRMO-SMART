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

- The current public viewer hydrates the legacy `payload.galleries` array before the structured `payload.tiles.items` representation. Updating only tiles.items does not update the public gallery.
- For every project addition, media reorder, caption change or visibility change, keep the matching legacy gallery tile (`overlay`, `meta`, `media`, `display`, `isVisible`) and structured tile (`title`, `shortDescription`, `files`, `filesMeta`, `visible`) synchronized.
- Verify the legacy gallery media count, order, caption and visibility as well as the structured record before reporting a publication. Scope updates to the requested projects and preserve unrelated content.
