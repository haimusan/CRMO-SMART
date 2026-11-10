# CRMO DEV — Pre-publication approval workflow

Status: development specification; NOT deployed.

## Goal
Treat gallery `pre-publication` as a permanent private staging queue. Its visibility flags remain false. Do not publish staging tiles directly or expose them through public menus/routes.

## Candidate model
Each candidate tracks: candidateId, sourcePath, sourceFingerprint, projectId (nullable), proposedGalleryId, matchingEvidence, confidence, mediaFingerprint, status, reviewNotes, approvedBy, approvedAt, publishedAt, and rollbackSnapshotId. Statuses: collected, needs_improvement, ready_for_review, match_approved, publish_approved, published, rejected.

## Matching
1. Prefer stable projectId.
2. Compare normalized project/brand/client names and original folder paths.
3. Compare source fingerprints and media perceptual hashes where available.
4. Display possible matches with confidence and evidence; never auto-merge on fuzzy match.
5. Exact media duplicates must not be added twice.

## Review UI
For each staging tile, show source and proposed destination, side-by-side public vs candidate media, detected duplicate markers, project match confidence, and explicit actions: Confirm match, Change destination, Reject, Approve publication. Match confirmation must not publish.

## Publish transaction
Require explicit approval and recheck access, target project, media existence and duplicate hashes. Snapshot previous public config. If matched, append approved unique media to existing project while preserving existing ordering and metadata. Otherwise create a project only in explicitly approved target gallery. Record audit event and rollback pointer. Verify public/admin parity and direct route after publish. Never expose private storage files by changing bucket visibility.

## Acceptance criteria
- Admin sees hidden gallery; anonymous viewer never sees its tiles or route.
- A candidate matching a public project updates that project, never creates duplicate.
- No public change after match approval alone.
- Publish requires separate affirmative action.
- Duplicate image does not get appended.
- Failed publish leaves public content unchanged; rollback is possible.
- Desktop 16:9, lightbox, direct category link and version parity pass QA.

Priority: public CRMO stability remains 80%; implement this only on DEV and do not deploy untested code.
