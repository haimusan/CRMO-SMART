# CRMO 3286

The public entry point is `index.html`. The numbered working editor is `admin/CRMO_v3286.html`.

Keep the downloaded folder structure intact. The public page and working editor use the same page-width container and font. Both header account controls open the registration/login dialog in the current page.

This is a review version. It has not replaced the live website.

## Code checks

Run `node tests/public-auth.cjs` and `node tests/permissions.cjs`. The display test also requires an external local content fixture: `node tests/viewer.cjs /path/to/test-fixture.json`.

The tests check shared layout markup, account-dialog behavior, role gating and display data consistency. They do not replace visual testing in a browser.
