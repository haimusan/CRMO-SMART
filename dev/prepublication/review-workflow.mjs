// CRMO DEV only. Pure staging review logic; no network writes or automatic publication.
export const STAGING_GALLERY_ID = "pre-publication";
export const STATUSES = Object.freeze(["collected","needs_improvement","ready_for_review","match_approved","publish_approved","published","rejected"]);
const norm = value => String(value ?? "").normalize("NFKC").trim().toLocaleLowerCase().replace(/[\s_\-–—]+/g," ");
const images = tile => Array.isArray(tile?.media) ? tile.media : [];
const meta = tile => tile?.meta || {};
const identifiers = tile => [tile?.projectId,meta(tile).projectId].filter(Boolean).map(norm);
const imageKeys = tile => new Set(images(tile).flatMap(m => [m?.storagePath && m?.storageBucket ? m.storageBucket + "/" + m.storagePath : null,m?.sha256,m?.fingerprint,m?.src].filter(Boolean).map(norm)));
export function findMatches(candidate, galleries) {
  if (!candidate || !Array.isArray(galleries)) throw new TypeError("Invalid candidate or galleries");
  const result=[];
  for (const gallery of galleries) {
    const id=gallery?.galleryId ?? gallery?.id;
    if (id===STAGING_GALLERY_ID || gallery?.meta?.visible===false || gallery?.meta?.visible==="false") continue;
    for (const [index, tile] of (gallery?.tiles || []).entries()) {
      const evidence=[];
      const cids=identifiers(candidate), tids=identifiers(tile);
      if(cids.some(x=>tids.includes(x))) evidence.push("projectId");
      const a=meta(candidate),b=meta(tile);
      for(const key of ["brand","client"]) if(norm(a[key]) && norm(a[key])===norm(b[key])) evidence.push(key);
      if(norm(candidate.sourcePath) && norm(candidate.sourcePath)===norm(tile.sourcePath)) evidence.push("sourcePath");
      const existing=imageKeys(tile), overlap=[...imageKeys(candidate)].filter(x=>existing.has(x));
      if(overlap.length) evidence.push("identicalMedia");
      const score=evidence.includes("projectId")?100:evidence.includes("identicalMedia")?95:Math.min(85,evidence.length*30);
      if(score) result.push({galleryId:id,tileIndex:index,score,evidence,duplicateMediaKeys:overlap});
    }
  }
  return result.sort((a,b)=>b.score-a.score);
}
export function confirmMatch(candidate, match, reviewer) {
  if(candidate.status!=="ready_for_review") throw new Error("Candidate not ready for review");
  if(!reviewer || !match?.galleryId || !Number.isInteger(match.tileIndex)) throw new Error("Explicit reviewer and destination required");
  return {...candidate,status:"match_approved",matchedDestination:{galleryId:match.galleryId,tileIndex:match.tileIndex},matchApprovedBy:reviewer};
}
export function approvePublication(candidate, reviewer) {
  if(candidate.status!=="match_approved" || !candidate.matchedDestination || !reviewer) throw new Error("Match approval required before publication approval");
  return {...candidate,status:"publish_approved",publicationApprovedBy:reviewer};
}
export function preparePublish(candidate, galleries) {
  if(candidate?.status!=="publish_approved") throw new Error("Explicit publication approval required");
  const dest=candidate.matchedDestination;
  if(!dest || dest.galleryId===STAGING_GALLERY_ID) throw new Error("Invalid public destination");
  const target=galleries.find(g=>(g.galleryId??g.id)===dest.galleryId);
  if(!target || target.meta?.visible===false || target.meta?.visible==="false") throw new Error("Destination unavailable");
  const old=target.tiles?.[dest.tileIndex];
  if(!old) throw new Error("Destination project no longer exists; re-review required");
  if(identifiers(candidate).length && identifiers(old).length && !identifiers(candidate).some(x=>identifiers(old).includes(x))) throw new Error("Project changed; re-review required");
  const seen=imageKeys(old);
  const unique=images(candidate).filter(m=>{
    const keys=[m?.storagePath && m?.storageBucket ? m.storageBucket+"/"+m.storagePath:null,m?.sha256,m?.fingerprint,m?.src].filter(Boolean).map(norm);
    if(!keys.length || keys.some(k=>seen.has(k))) return false;
    keys.forEach(k=>seen.add(k));return true;
  });
  const updated={...old,media:[...images(old),...unique]};
  const tiles=[...target.tiles];tiles[dest.tileIndex]=updated;
  const next=galleries.map(g=>g===target?{...g,tiles}:g);
  return {nextGalleries:next,addedMediaCount:unique.length,previousGalleries:galleries,requiresPersistenceAndVerification:true};
}
// The caller must atomically persist with revision check, audit, snapshot and rollback,
// then verify public/admin parity. This module deliberately never writes to Supabase.
