// 식품의약품안전처 식품영양성분DB API를 브라우저 대신 서버에서 호출하는 프록시 함수
import { getEnv } from './_env.js';

export const config = { runtime: 'edge' };

const BASE_URL =
  'https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02/getFoodNtrCpntDbInq02';

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const q    = searchParams.get('q')    ?? '';
  const page = searchParams.get('page') ?? '1';
  const rows = searchParams.get('rows') ?? '10';

  const serviceKey = getEnv('FOOD_DB_API_KEY');
  if (!serviceKey) {
    return new Response('FOOD_DB_API_KEY not configured', { status: 500 });
  }
  if (!q.trim()) {
    return new Response('[]', {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }

  const url = new URL(BASE_URL);
  url.searchParams.set('serviceKey', serviceKey);
  url.searchParams.set('type', 'json');
  url.searchParams.set('FOOD_NM_KR', q);
  url.searchParams.set('pageNo', page);
  url.searchParams.set('numOfRows', rows);

  const upstream = await fetch(url.toString());
  if (!upstream.ok) {
    return new Response(`Upstream error: ${upstream.status}`, { status: 502 });
  }

  const data = await upstream.json();
  if (data?.header?.resultCode !== '00') {
    return new Response('[]', {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }

  // 실제 API 응답: body.items 가 직접 배열 (Swagger 스키마의 items.item 과 다름)
  const rawItems = data?.body?.items ?? [];
  const items    = Array.isArray(rawItems) ? rawItems : [rawItems];

  const mapped = items.map((item, i) => {
    // 영양성분 함량 기준량 (보통 100g)
    const basis = parseFloat(item.SERVING_SIZE) || 100;
    // 1회 섭취 참고량 (Z10500) 우선, 없으면 기준량과 동일하게 취급
    const serving = parseFloat(item.Z10500) || basis;
    const factor  = serving / basis;

    const kcal = parseFloat(item.AMT_NUM1) || 0;
    const prot = parseFloat(item.AMT_NUM3) || 0;
    const fat  = parseFloat(item.AMT_NUM4) || 0;
    const carb = parseFloat(item.AMT_NUM6) || 0;

    const scale = (base, f) => Math.round(base * factor * f * 10) / 10;

    return {
      id:       i + 1,
      name:     item.FOOD_NM_KR ?? '알 수 없음',
      category: item.FOOD_CAT1_NM ?? '',
      maker:    item.MAKER_NM ?? '',
      serving,
      qty: 'medium',
      cals:    { small: scale(kcal, 0.7), medium: scale(kcal, 1.0), large: scale(kcal, 1.3) },
      protein: { small: scale(prot, 0.7), medium: scale(prot, 1.0), large: scale(prot, 1.3) },
      carb:    { small: scale(carb, 0.7), medium: scale(carb, 1.0), large: scale(carb, 1.3) },
      fat:     { small: scale(fat,  0.7), medium: scale(fat,  1.0), large: scale(fat,  1.3) },
    };
  });

  return new Response(JSON.stringify(mapped), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET',
  };
}
