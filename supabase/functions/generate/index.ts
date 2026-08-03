import { withSupabase } from "npm:@supabase/server@^1";

// 환경변수 가져오기
const ALAN_CLIENT_ID = Deno.env.get("ALAN_CLIENT_ID");
const ALAN_BASE = "https://kdt-api-function.azurewebsites.net/api/v1";

// JSON 응답 함수 만들기
function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default {
  fetch: withSupabase({ auth: "publishable" }, async (req, ctx) => {
    // 1. CORS 사전 요청 처리
    // withSupabase가 OPTIONS 요청과 CORS 헤더를 자동으로 처리

    // 2. POST 요청인지 확인
    if (req.method !== "POST") {
      return jsonResponse({ error: "method_not_allowed" }, 405);
    }

    // 3. 필수 환경변수 확인
    if (!ALAN_CLIENT_ID) {
      return jsonResponse({ error: "missing_environment_variable" }, 500);
    }

    // 4. 요청 본문에서 생성 조건 가져오기
    const body = await req.json().catch(() => ({}));
    const preset_code = body?.preset_code?.trim();
    const format_code = body?.format_code?.trim();
    const level = Number(body?.level) || 1;

    // 5. 입력값 검증
    if (!preset_code || !format_code) {
      return jsonResponse(
        {
          error: "invalid_request",
          detail: "preset_code와 format_code는 필수입니다",
        },
        400,
      );
    }

    // 6. Supabase 클라이언트 가져오기 (호출자 권한 — RLS 적용됨)
    const db = ctx.supabase;

    // 7. 폴백 조회 함수 (AI 실패 시 사용)
    async function getFallback() {
      const { data } = await db
        .from("default_contents")
        .select("title, scripts, tips")
        .eq("is_active", true)
        .eq("preset_code", preset_code)
        .eq("format_code", format_code)
        .limit(30);

      if (!data?.length) return [];
      return data.sort(() => Math.random() - 0.5).slice(0, 3);
    }

    try {
      // 8. 앨런 이전 대화 상태 초기화
      await fetch(`${ALAN_BASE}/reset-state`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: ALAN_CLIENT_ID }),
      });

      // 9. 앨런 AI로 대화 소재 생성
      const prompt = `회식에서 직장 동료와 나눌 대화 질문 3개를 만들어줘.
카드 하나에 질문은 딱 1개. 여러 개 넣지 마.
검색하지 말고 직접 창작해. 출처나 링크 붙이지 마.
아래 JSON 형식만 출력. 설명이나 인사말 금지.
{"results":[{"title":"주제","scripts":["질문 1개"],"tips":["팁1","팁2"]}]}
results는 3개, 각 scripts는 1개, 각 tips는 2개.
금지 소재: 연봉, 인사평가, 승진, 사내정치, 사생활, 음주강요, 정치, 종교`;

      const alanResponse = await fetch(
        `${ALAN_BASE}/question?content=${encodeURIComponent(prompt)}` +
          `&client_id=${ALAN_CLIENT_ID}`,
      );

      // 10. 앨런 호출 오류 확인
      if (!alanResponse.ok) {
        const results = await getFallback();
        return jsonResponse({
          source: "fallback",
          reason: "alan_request_failed",
          status: alanResponse.status,
          results,
        });
      }

      const alanJson = await alanResponse.json();
      const answer = alanJson?.answer ?? "";

      // 11. 응답에서 JSON 부분만 추출
      const match = answer.match(/\{[\s\S]*\}/);
      if (!match) {
        const results = await getFallback();
        return jsonResponse({
          source: "fallback",
          reason: "alan_json_not_found",
          results,
        });
      }

      // 12. JSON 파싱 오류 확인
      let parsed;
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        const results = await getFallback();
        return jsonResponse({
          source: "fallback",
          reason: "alan_json_parse_failed",
          results,
        });
      }

      // 13. 결과 개수 검증
      const results = Array.isArray(parsed?.results) ? parsed.results : [];
      if (results.length === 0) {
        const fallback = await getFallback();
        return jsonResponse({
          source: "fallback",
          reason: "alan_empty_results",
          results: fallback,
        });
      }

      // 14. 생성 결과를 프론트엔드에 반환
      return jsonResponse({ source: "ai", results });
    } catch (error) {
      // 15. 예상치 못한 오류 — 폴백으로 화면은 유지
      console.log(error);
      const results = await getFallback();
      return jsonResponse({
        source: "fallback",
        reason: "server_error",
        detail: error instanceof Error ? error.message : String(error),
        results,
      });
    }
  }),
};
