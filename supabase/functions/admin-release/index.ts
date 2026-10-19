// Authenticated release metadata; editor bytes stay in the private admin bucket.
const serviceURL = Deno.env.get('SUPABASE_URL')!;
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const headers = {
  'Access-Control-Allow-Origin': 'https://www.crmo.co.il',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json',
};
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'GET') return new Response('{}', { status: 405, headers });
  const authorization = req.headers.get('authorization') || '';
  if (!authorization.startsWith('Bearer ')) return new Response('{}', { status: 401, headers });
  const options = { headers: { apikey: anonKey, Authorization: authorization } };
  const identity = await fetch(`${serviceURL}/auth/v1/user`, options);
  if (!identity.ok) return new Response('{}', { status: 401, headers });
  const user = await identity.json();
  const roleResponse = await fetch(`${serviceURL}/rest/v1/crmo_user_roles?select=role&user_id=eq.${encodeURIComponent(user.id)}`, options);
  const roles = roleResponse.ok ? await roleResponse.json() : [];
  if (!roles.some((r: {role: string}) => ['admin', 'owner'].includes(r.role))) return new Response('{}', { status: 403, headers });
  const manifest = await fetch(`${serviceURL}/storage/v1/object/authenticated/admin/latest.json`, options);
  if (!manifest.ok) return new Response('{}', { status: 503, headers });
  return new Response(await manifest.text(), { headers });
});
