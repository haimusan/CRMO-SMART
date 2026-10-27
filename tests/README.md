Editor integration fixtures are private and are not published with the website.
Local integration tests use `../crmo-private-fixtures/CRMO_v3286.html` relative to this checkout.
Obtain the fixture from an authorized editor release; do not commit it into the public repository.

Run the role/entry tests with `node tests/auth-routing.cjs` and the synchronization tests with
`node tests/content-sync.cjs` and `node --test tests/content-*.test.cjs`.
