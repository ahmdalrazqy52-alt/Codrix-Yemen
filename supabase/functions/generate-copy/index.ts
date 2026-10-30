import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } });
  try {
    const auth = req.headers.get('Authorization');
    if (!auth) return new Response(JSON.stringify({ error: 'Authentication required' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } });
    const url = Deno.env.get('SUPABASE_URL')!;
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const client = createClient(url, anon, { global: { headers: { Authorization: auth } } });
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } });
    const { data: admin } = await client.from('admin_users').select('role').eq('user_id', userData.user.id).eq('active', true).maybeSingle();
    if (!admin) return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers: { ...cors, 'Content-Type': 'application/json' } });
    const key = Deno.env.get('OPENAI_API_KEY');
    if (!key) return new Response(JSON.stringify({ error: 'لم يتم إعداد مفتاح خدمة الذكاء الاصطناعي في Supabase بعد.' }), { status: 503, headers: { ...cors, 'Content-Type': 'application/json' } });
    const contentLength = Number(req.headers.get('content-length') || 0);
    if (contentLength > 12_000) {
      return new Response(JSON.stringify({ error: 'حجم الطلب أكبر من المسموح' }), { status: 413, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    const body: unknown = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return new Response(JSON.stringify({ error: 'بيانات الطلب غير صحيحة' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    const input = body as Record<string, unknown>;
    const action = input.action === 'description' ? 'description' : 'improve';
    const text = typeof input.text === 'string' ? input.text.trim().slice(0, 5000) : '';
    const context = typeof input.context === 'string' ? input.context.trim().slice(0, 300) : '';
    if (action === 'improve' && !text) {
      return new Response(JSON.stringify({ error: 'أدخل النص المطلوب تحسينه' }), { status: 422, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    if (action === 'description' && !context && !text) {
      return new Response(JSON.stringify({ error: 'أدخل وصف الخدمة أو سياقها' }), { status: 422, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    const language = input.language === 'en' ? 'English' : 'Arabic';
    const prompt = action === 'description'
      ? `Write a polished, concise service description for a technology company website. Service/context: ${context || text}. Language: ${language}. Return only the copy, no quotation marks.`
      : `Improve the following website copy for clarity, professionalism, and conversion without inventing claims. Keep its meaning. Language: ${language}. Text: ${text}. Return only the improved copy.`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini', messages: [{ role: 'system', content: 'You are a professional Arabic/English UX copywriter for Codrix Yemen, an independent technology services company.' }, { role: 'user', content: prompt }], temperature: 0.65, max_tokens: 500 }),
    });
    const result = await response.json();
    if (!response.ok) return new Response(JSON.stringify({ error: result.error?.message || 'AI provider error' }), { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
    const output = result.choices?.[0]?.message?.content?.trim();
    if (!output) throw new Error('No generated text');
    return new Response(JSON.stringify({ text: output }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected error' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
