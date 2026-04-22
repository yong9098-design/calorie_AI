const { getEnv } = require('./_env');

const MODEL_IDS = {
  flash: 'gemini-2.5-flash',
  pro: 'gemini-2.5-pro',
};

const ANALYSIS_PROMPT = [
  'Analyze this food photo and estimate nutrition for a single serving.',
  'Return the food name, quantity, total calories, protein, carbs, and fat.',
  'Also return a components array listing each visible food item separately with its name, estimated quantity, calorie range (min/max), and a brief note.',
  'If the dish appears Korean, return food_name, component names, quantities, and notes in Korean.',
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

const DEFAULT_PROMPT = [
  '음식 사진을 분석해서 JSON 형식으로만 응답해주세요. 다른 텍스트 없이 JSON만 응답하세요.',
  '{"food_name":"음식명 추정값","calories":숫자,"protein":숫자,"carbs":숫자,"fat":숫자,"quantity":"1인분"}',
].join('\n');

function getBearerToken(req) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;

  if (typeof req.body === 'string') {
    return req.body.trim() ? JSON.parse(req.body) : {};
  }

  return new Promise((resolve, reject) => {
    let raw = '';

    req.on('data', chunk => {
      raw += chunk;
    });

    req.on('end', () => {
      if (!raw) return resolve({});

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

async function getUserGeminiModel(accessToken) {
  const SUPABASE_URL = getEnv('SUPABASE_URL');
  const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY');

  if (!accessToken || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return 'flash';
  }

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
  } catch (error) {
    return 'flash';
  }
}

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

async function requestGemini({ model, mimeType, data, apiKey }) {
  const resolvedModel = MODEL_IDS[model] ? model : 'flash';
  const modelId = MODEL_IDS[resolvedModel];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const GEMINI_API_KEY_FLASH = getEnv('GEMINI_API_KEY_FLASH') || getEnv('GEMINI_API_KEY');
  const GEMINI_API_KEY_PRO = getEnv('GEMINI_API_KEY_PRO') || GEMINI_API_KEY_FLASH;

  if (!GEMINI_API_KEY_FLASH) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY_FLASH' });
  }

  let body;

  try {
    body = await readJsonBody(req);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const mimeType = body?.image?.mimeType;
  const data = body?.image?.data;

  if (!mimeType || !data) {
    return res.status(400).json({
      error: 'image.mimeType and image.data are required',
    });
  }

  const requestedModel = await getUserGeminiModel(getBearerToken(req));

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
      return res.status(geminiRes.status).json({
        error: geminiJson?.error?.message || 'Gemini request failed',
      });
    }

    const text =
      geminiJson?.candidates
        ?.flatMap(candidate => candidate?.content?.parts || [])
        ?.filter(part => typeof part?.text === 'string')
        ?.map(part => part.text)
        ?.join('') || '';

    if (!text) {
      return res.status(502).json({ error: 'Gemini returned no text output' });
    }

    return res.status(200).json({ text, model });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Unexpected server error',
    });
  }
};
