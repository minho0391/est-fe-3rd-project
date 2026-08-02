const ALAN = "https://kdt-api-function.azurewebsites.net/api/v1";
const CLIENT_ID = process.env.ALAN_CLIENT_ID;

export async function GET() {
  // 1) 이전 대화 상태 초기화
  await fetch(`${ALAN}/reset-state`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: CLIENT_ID }),
  });

  // 2) 질의
  const prompt = `회식에서 직장 동료와 나눌 대화 질문 3개를 만들어줘.
카드 하나에 질문은 딱 1개. 여러 개 넣지 마.
검색하지 말고 직접 창작해. 출처나 링크 붙이지 마.
아래 JSON 형식만 출력. 설명이나 인사말 금지.
{"results":[{"title":"주제","scripts":["질문 1개"],"tips":["팁1","팁2"]}]}
results는 3개, 각 scripts는 1개, 각 tips는 2개.
금지 소재: 연봉, 인사평가, 승진, 사내정치, 사생활, 음주강요, 정치, 종교`;

  const url = `${ALAN}/question?content=${encodeURIComponent(prompt)}&client_id=${CLIENT_ID}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const match = data.answer?.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("JSON 없음");
    return Response.json({ source: "ai", ...JSON.parse(match[0]) });
  } catch (e) {
    return Response.json({ source: "failed", error: e.message }, { status: 502 });
  }
}
