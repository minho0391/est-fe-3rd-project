import { withSupabase } from "npm:@supabase/server@^1";

// 환경변수 가져오기
const ALAN_CLIENT_ID = Deno.env.get("ALAN_CLIENT_ID");
const ALAN_BASE = "https://kdt-api-function.azurewebsites.net/api/v1";

// 상황 코드 → 프롬프트 문장
const PRESET_LABELS: Record<string, string> = {
  dinner: "회식 자리에서 직장 동료들과",
  mt: "MT에서 같은 조 사람들과",
  blind_date: "소개팅 자리에서 처음 만난 상대와",
  ot: "OT에서 처음 만난 동기들과",
};

// 형식 코드 → 이름 + 형식별 지시문
const FORMAT_RULES: Record<string, { label: string; guide: string }> = {
  question: {
    label: "대화 질문",
    guide: "한 사람이 답하면 자연스럽게 이야기가 이어지는 질문으로 만들어줘.",
  },
  topic: {
    label: "대화 주제",
    guide: "여러 명이 각자 의견을 낼 수 있는 주제로 만들어줘.",
  },
  quiz: {
    label: "퀴즈",
    guide: "정답이 있는 문제로 만들고, tips 중 하나에 정답을 넣어줘.",
  },
  balance: {
    label: "밸런스 게임",
    guide: "두 선택지를 'A vs B' 형태로 한 문장에 담아줘.",
  },
  humor: {
    label: "가벼운 유머 소재",
    guide:
      "웃으며 넘길 수 있는 가벼운 소재로 만들어줘. 특정인을 깎아내리는 농담은 금지.",
  },
  game: {
    label: "간단한 게임",
    guide:
      "준비물 없이 앉은 자리에서 바로 할 수 있는 게임으로 만들고, 진행 방법을 한 문장으로 설명해줘.",
  },
  mission: {
    label: "미션",
    guide:
      "여러 명이 함께 수행하는 활동으로 만들어줘. 1분 안에 자리에서 끝낼 수 있어야 해.",
  },
  penalty: {
    label: "벌칙",
    guide: "게임에서 진 사람 한 명이 즉석에서 수행하는 벌칙이야. " +
      "'애교 부리기', '성대모사 하기', '아무 노래나 한 소절 부르기'처럼 " +
      "즉석에서 몸이나 목소리로 수행하는 행동이어야 해. " +
      "속마음이나 비밀을 이야기하는 건 벌칙이 아니야. " +
      "살짝 민망하지만 웃고 넘길 수 있는 수준으로. 술 마시기는 금지.",
  },
};

// 대화형 형식용 난이도 문구
const LEVEL_LABELS: Record<number, string> = {
  1: "처음 만난 사이에서도 부담 없는 가벼운 난이도",
  2: "어느 정도 친해진 사이에서 나눌 만한 중간 난이도",
  3: "속 이야기까지 꺼낼 수 있는 깊은 난이도",
};

// 벌칙·게임·미션처럼 행동하는 형식은 '깊이' 대신 '수위'로 표현
const ACTION_LEVEL_LABELS: Record<number, string> = {
  1: "누구나 부담 없이 할 수 있는 약한 수위",
  2: "적당히 민망한 중간 수위",
  3: "꽤 민망하지만 웃고 넘길 수 있는 센 수위",
};

const ACTION_FORMATS = ["penalty", "game", "mission"];

// JSON 응답 함수 만들기
function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// 요청받은 조건을 실제 프롬프트로 변환
function buildPrompt(
  presetCode: string,
  formatCode: string,
  level: number,
): string {
  const situation = PRESET_LABELS[presetCode] ?? `${presetCode} 상황에서`;
  const format = FORMAT_RULES[formatCode] ?? {
    label: `${formatCode} 형식의 콘텐츠`,
    guide: "",
  };
  // 형식에 따라 난이도 표현 방식을 다르게 적용
  const levelTable = ACTION_FORMATS.includes(formatCode)
    ? ACTION_LEVEL_LABELS
    : LEVEL_LABELS;
  const depth = levelTable[level] ?? levelTable[1];

  return `${situation} 함께할 ${format.label} 3개를 만들어줘.
${format.guide}
난이도는 ${depth}로 맞춰줘.
카드 하나에 내용은 딱 1개. 여러 개 넣지 마.
검색하지 말고 직접 창작해. 출처나 링크 붙이지 마.
아래 JSON 형식만 출력. 설명이나 인사말 금지.
{"results":[{"title":"주제","scripts":["내용 1개"],"tips":["팁1","팁2"]}]}
results는 3개, 각 scripts는 1개, 각 tips는 2개.
금지 소재: 연봉, 인사평가, 승진, 사내정치, 사생활, 음주강요, 정치, 종교`;
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
      console.error("[generate] ALAN_CLIENT_ID 환경변수가 설정되지 않음");
      return jsonResponse({ error: "missing_environment_variable" }, 500);
    }

    // 4. 요청 본문에서 생성 조건 가져오기
    //    숫자 등이 들어와도 터지지 않도록 String()으로 감쌈
    const body = await req.json().catch(() => ({}));
    const preset_code = String(body?.preset_code ?? "").trim();
    const format_code = String(body?.format_code ?? "").trim();
    const rawLevel = Number(body?.level);
    // level은 1~3 범위로 고정 (범위 밖 값이 프롬프트에 그대로 들어가는 것 방지)
    const level = Number.isFinite(rawLevel)
      ? Math.min(3, Math.max(1, Math.trunc(rawLevel)))
      : 1;

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

    // 매핑에 없는 코드도 동작은 시키되, 오타/신규 코드 추적용으로 로그를 남김
    if (!PRESET_LABELS[preset_code]) {
      console.error(`[generate] 알 수 없는 preset_code: ${preset_code}`);
    }
    if (!FORMAT_RULES[format_code]) {
      console.error(`[generate] 알 수 없는 format_code: ${format_code}`);
    }

    // 6. Supabase 클라이언트 가져오기 (호출자 권한 — RLS 적용됨)
    const db = ctx.supabase;

    // 7. 폴백 조회 함수 (AI 실패 시 사용)
    async function getFallback() {
      const { data, error } = await db
        .from("default_contents")
        .select("title, scripts, tips")
        .eq("is_active", true)
        .eq("preset_code", preset_code)
        .eq("format_code", format_code)
        .limit(30);

      // 폴백까지 비면 화면이 빈 채로 남으므로 원인을 반드시 로그에 남김
      if (error) {
        console.error("[generate] 폴백 조회 실패:", error);
        return [];
      }
      if (!data?.length) {
        console.error(
          `[generate] 폴백 데이터 없음 (preset=${preset_code}, format=${format_code})`,
        );
        return [];
      }
      return data.sort(() => Math.random() - 0.5).slice(0, 3);
    }

    // 폴백 응답 공통 처리 — 서버에는 상세 로그, 사용자에게는 reason만
    async function fallbackResponse(reason: string, detail?: unknown) {
      console.error(`[generate] 폴백 사용 (${reason}):`, detail ?? "");
      const results = await getFallback();
      return jsonResponse({ source: "fallback", reason, results });
    }

    try {
      // 8. 앨런 이전 대화 상태 초기화
      await fetch(`${ALAN_BASE}/reset-state`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: ALAN_CLIENT_ID }),
      });

      // 9. 앨런 AI로 콘텐츠 생성 (요청받은 조건을 프롬프트에 반영)
      const prompt = buildPrompt(preset_code, format_code, level);

      const alanResponse = await fetch(
        `${ALAN_BASE}/question?content=${encodeURIComponent(prompt)}` +
          `&client_id=${ALAN_CLIENT_ID}`,
      );

      // 10. 앨런 호출 오류 확인
      if (!alanResponse.ok) {
        return await fallbackResponse(
          "alan_request_failed",
          `status=${alanResponse.status}`,
        );
      }

      const alanJson = await alanResponse.json();
      const answer = alanJson?.answer ?? "";

      // 11. 응답에서 JSON 부분만 추출
      const match = answer.match(/\{[\s\S]*\}/);
      if (!match) {
        return await fallbackResponse("alan_json_not_found", answer);
      }

      // 12. JSON 파싱 오류 확인
      let parsed;
      try {
        parsed = JSON.parse(match[0]);
      } catch (error) {
        return await fallbackResponse("alan_json_parse_failed", error);
      }

      // 13. 결과 개수 검증
      const results = Array.isArray(parsed?.results) ? parsed.results : [];
      if (results.length === 0) {
        return await fallbackResponse("alan_empty_results");
      }

      // 14. 생성 결과를 프론트엔드에 반환
      return jsonResponse({ source: "ai", results });
    } catch (error) {
      // 15. 예상치 못한 오류 — 폴백으로 화면은 유지
      //     세부 오류는 서버 로그에만 남기고 응답에는 포함하지 않음
      return await fallbackResponse("server_error", error);
    }
  }),
};
