import { getEnv } from './_env.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { Allow: 'GET', 'Content-Type': 'application/json' },
    });
  }

  const SUPABASE_URL = getEnv('SUPABASE_URL');
  const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY');

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return new Response(JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({ supabaseUrl: SUPABASE_URL, supabaseAnonKey: SUPABASE_ANON_KEY }),
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
    }
  );
}
