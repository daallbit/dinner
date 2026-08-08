/* ============================================
   Gemini API 연동 설정
   ============================================
   1) https://aistudio.google.com/apikey 에서 무료 API 키를 발급받으세요.
   2) 아래 GEMINI_API_KEY 값에 발급받은 키를 붙여넣으세요.
   3) 주의: 이 파일은 공개 저장소에 그대로 올라가므로,
      키가 코드에 노출됩니다. 개인적으로 가볍게 쓰는 용도로만 사용하세요.
   ============================================ */

const GEMINI_API_KEY = "AQ.Ab8RN6IVPLD9PSYEt3Q87fY_OwX5c5N_WfYIoqjAqYRpRXNpaw";

async function fetchDishFromGemini(activeCat){
  const catInstruction = activeCat === "all"
    ? "한식, 중식, 일식, 양식, 분식 중 아무 카테고리나 골라서"
    : `반드시 "${activeCat}" 카테고리 안에서`;

  const prompt = `너는 저녁 메뉴 추천 앱이야. ${catInstruction} 오늘 저녁으로 어울리는 음식을 딱 하나만 추천해줘.
매번 다른, 창의적이고 의외성 있는 메뉴를 골라줘 (너무 뻔한 메뉴만 반복하지 말고).
아래 JSON 형식으로만 응답하고 다른 텍스트는 절대 포함하지 마:
{"name": "메뉴 이름", "cat": "한식|중식|일식|양식|분식 중 하나", "note": "재치있고 짧은 한 줄 설명 (25자 내외)", "spice": "매운 정도를 이모지로, 안 매우면 빈 문자열"}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    }
  );

  if(!res.ok) throw new Error('Gemini API 요청 실패: ' + res.status);

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if(!text) throw new Error('Gemini 응답이 비어있음');

  const parsed = JSON.parse(text);
  if(!parsed.name) throw new Error('Gemini 응답 형식 오류');
  return parsed;
}
