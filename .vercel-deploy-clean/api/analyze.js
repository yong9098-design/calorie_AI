import { getEnv } from './_env.js';

export const config = { runtime: 'edge' };

const MODEL_IDS = {
  flash: 'gemini-2.5-flash',
  pro: 'gemini-2.5-pro',
};

const ANALYSIS_PROMPT = [
  '이 음식 사진을 분석하여 1인분 기준 영양 정보를 추정해주세요.',
  '음식명, 양, 총 칼로리, 단백질, 탄수화물, 지방을 반환하세요.',
  '또한 사진에 보이는 각 음식 항목을 개별적으로 나열한 components 배열도 반환하세요.',
  'components에는 각 항목의 이름, 예상 양, 칼로리 범위(최소/최대), 간단한 설명을 포함하세요.',
  '모든 텍스트(food_name, 음식명, 설명, note 등)는 반드시 한국어로 작성하세요.',
].join(' ');

const RESPONSE_JSON_SCHEMA = {
  type: 'object',
  properties: {
    food_name: { type: 'string' },
    calories: { type: 'number' },
    protein: { type: 'number' },
    carbs: { type: 'number' },
    fat: { type: 'number' },
    quantity: { type: 'string' },
    components: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          quantity: { type: 'string' },
          calories_min: { type: 'number' },
          calories_max: { type: 'number' },
          note: { type: 'string' },
        },
        required: ['name', 'quantity', 'calories_min', 'calories_max', 'note'],
        additionalProperties: false,
      },
    },
  },
  required: ['food_name', 'calories', 'protein', 'carbs', 'fat', 'quantity', 'components'],
  additionalProperties: false,
};

function getGenerationConfig(model) {
  return {
    temperature: 0.1,
    maxOutputTokens: model === 'pro' ? 1024 : 512,
    responseMimeType: 'application/json',
    responseJsonSchema: RESPONSE_JSON_SCHEMA,
    thinkingConfig: {
      thinkingBudget: model === 'pro' ? 128 : 0,
    },
  };
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

async function getUserGeminiModel(accessToken) {
  const SUPABASE_URL = getEnv('SUPABASE_URL');
  const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY');

  if (!accessToken || !SUPABASE_URL || !SUPABASE_ANON_KEY) return 'flash';

  try {
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!userRes.ok) return 'flash';

    const user = await userRes.json();
    if (!user?.id) return 'flash';

    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=gemini_model&id=eq.${encodeURIComponent(user.id)}&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );
    if (!profileRes.ok) return 'flash';

    const profiles = await profileRes.json().catch(() => []);
    return profiles?.[0]?.gemini_model === 'pro' ? 'pro' : 'flash';
  } catch {
    return 'flash';
  }
}

async function requestGemini({ model, mimeType, data, apiKey }) {
  const resolvedModel = MODEL_IDS[model] ? model : 'flash';
  const modelId = MODEL_IDS[resolvedModel];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: ANALYSIS_PROMPT },
              { inline_data: { mime_type: mimeType, data } },
            ],
          },
        ],
        generationConfig: getGenerationConfig(resolvedModel),
      }),
    }
  );

  const json = await response.json().catch(() => ({}));
  return { response, json, model: resolvedModel };
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method Not Allowed' }, 405, { Allow: 'POST' });
  }

  const GEMINI_API_KEY_FLASH = getEnv('GEMINI_API_KEY_FLASH') || getEnv('GEMINI_API_KEY');
  const GEMINI_API_KEY_PRO = getEnv('GEMINI_API_KEY_PRO') || GEMINI_API_KEY_FLASH;

  if (!GEMINI_API_KEY_FLASH) {
    return jsonResponse({ error: 'Missing GEMINI_API_KEY_FLASH' }, 500);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const mimeType = body?.image?.mimeType;
  const data = body?.image?.data;

  if (!mimeType || !data) {
    return jsonResponse({ error: 'image.mimeType and image.data are required' }, 400);
  }

  const authHeader = req.headers.get('authorization') || '';
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  const accessToken = tokenMatch ? tokenMatch[1] : null;

  const requestedModel = await getUserGeminiModel(accessToken);

  try {
    const apiKeyForModel = requestedModel === 'pro' ? GEMINI_API_KEY_PRO : GEMINI_API_KEY_FLASH;

    let { response: geminiRes, json: geminiJson, model } = await requestGemini({
      model: requestedModel,
      mimeType,
      data,
      apiKey: apiKeyForModel,
    });

    if (!geminiRes.ok && requestedModel === 'pro' && [403, 404, 429].includes(geminiRes.status)) {
      ({ response: geminiRes, json: geminiJson, model } = await requestGemini({
        model: 'flash',
        mimeType,
        data,
        apiKey: GEMINI_API_KEY_FLASH,
      }));
    }

    if (!geminiRes.ok) {
      return jsonResponse(
        { error: geminiJson?.error?.message || 'Gemini request failed' },
        geminiRes.status
      );
    }

    const text =
      geminiJson?.candidates
        ?.flatMap(candidate => candidate?.content?.parts || [])
        ?.filter(part => typeof part?.text === 'string')
        ?.map(part => part.text)
        ?.join('') || '';

    if (!text) {
      return jsonResponse({ error: 'Gemini returned no text output' }, 502);
    }

    return jsonResponse({ text, model });
  } catch (error) {
    return jsonResponse({ error: error.message || 'Unexpected server error' }, 500);
  }
}
