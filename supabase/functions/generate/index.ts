import { withSupabase } from "@supabase/server";
import { createClient } from "@supabase/supabase-js";

// 환경변수 가져오기
const ALAN_CLIENT_ID = Deno.env.get("ALAN_CLIENT_ID");
const ALAN_BASE = "https://kdt-api-function.azurewebsites.net/api/v1";

// DB 행 타입 (ctx.supabase에 스키마 제네릭이 없어 직접 선언)
type PresetRow = {
  id: number;
  title: string;
  conditions: {
    situation?: string;
    relation?: string;
    target?: string;
    mood?: string;
  } | null;
};

type OptionRow = {
  category: string;
  code: string;
  label: string;
};

type ContentRow = {
  title: string;
  scripts: string[];
  tips: string[] | null;
  extras: Record<string, unknown> | null;
  level: number | null;
};

type ResultItem = {
  title: string;
  scripts: string[];
  tips: string[];
  extras: Record<string, unknown>;
};

// 형식별 출력 규칙
const FORMAT_RULE: Record<string, string> = {
  question: "각 결과는 질문 1개. scripts에 질문 1개만 넣어.",
  balance:
    "각 결과는 둘 중 하나를 고르는 양자택일. scripts에 선택지 2개만 넣어. " +
    "각 선택지는 '~하기' 형태의 짧은 명사구로 써. 질문 문장이나 대답 문장으로 쓰지 마. " +
    '예: ["평생 여행만 하기", "평생 한 곳에 정착하기"]',
  topic: "각 결과는 오래 이어갈 대화 주제. scripts에 하위 화제 3개를 넣어.",
  mission:
    "각 결과는 자리에서 할 수 있는 행동 미션. scripts에 미션 1개만 넣어. " +
    "미션 문장은 40자 이내로 쓰고, 분량을 지시하는 표현은 문장에 넣지 마. " +
    '예: ["가장 기억에 남는 여행지 이야기하기"]',
  humor: "각 결과는 웃음을 유도하는 소재. scripts에 1개만 넣어.",
  quiz:
    "각 결과는 정답이 하나로 정해지는 상식 문제. scripts에 문제 1개, extras.answer에 정답을 넣어. " +
    "참가자 개인의 취향이나 경험을 맞히는 문제는 만들지 마. 정답에 '예시'라고 쓰지 마. " +
    "scripts에 '문제:' 같은 접두사 붙이지 말고 문제 문장만 써. " +
    "title은 '퀴즈 1' 같은 번호가 아니라 문제 소재를 드러내는 제목으로 써. " +
    '예: title "세계의 강", scripts ["세계에서 가장 긴 강은?"], answer "나일강"',
  game: "각 결과는 규칙과 승부가 있는 놀이. scripts에 진행 방법 1개만 넣어. " +
    "벌칙은 별도 형식이므로 게임 안에 벌칙 내용을 넣지 마.",
  penalty:
    "각 결과는 게임에서 진 사람이 수행할 벌칙. scripts에 벌칙 1개만 넣어. " +
    "tips는 빈 배열로 두고 아무것도 넣지 마.",
};

// 레벨별 깊이
const LEVEL_RULE: Record<number, string> = {
  1: "단답으로 끝나고 자기 개방이 거의 없는 가벼운 수준",
  2: "자기 경험을 몇 문장 풀어놓는 수준",
  3: "가치관이나 솔직한 속마음을 꺼내는 수준 (게임·벌칙은 적극적인 활동)",
};

// 프리셋별 금지 소재
const BANNED: Record<string, string> = {
  dinner:
    "연봉, 인사평가, 승진, 사내정치, 사생활 추궁, 음주 강요, 금전적 부담, 정치, 종교",
  blind_date: "외모 평가, 전 연애사 캐묻기, 수입, 가족사, 정치, 종교",
  ot:
    "외모 평가, 학벌·성적 비교, 입시 결과, 연애, 가족, 정치, 종교, 술·담배 강요",
  mt: "특정인 비하, 과한 스킨십 요구, 금전적 부담, 정치, 종교",
};

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
    const level = [1, 2, 3].includes(Number(body?.level))
      ? Number(body.level)
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
    if (!FORMAT_RULE[format_code]) {
      return jsonResponse(
        {
          error: "invalid_format",
          detail: `지원하지 않는 형식입니다: ${format_code}`,
        },
        400,
      );
    }

    // 6. Supabase 클라이언트 가져오기 (호출자 권한 — RLS 적용됨)
    const db = ctx.supabase;

    // 6-1. 호출자 세션이 실린 클라이언트 (저장용)
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    // 6-2. 응답 시간 측정 시작
    const startedAt = Date.now();

    // 7. 폴백 조회 함수 (AI 실패 시 사용)
    async function getFallback(): Promise<ResultItem[]> {
      const { data } = (await db
        .from("default_contents")
        .select("title, scripts, tips, extras, level")
        .eq("is_active", true)
        .eq("preset_code", preset_code)
        .eq("format_code", format_code)
        .limit(40)) as { data: ContentRow[] | null };

      if (!data?.length) return [];

      // 요청 레벨에 가까운 순 → 같은 거리끼리는 무작위 → 3개
      return data
        .map((row) => ({
          row,
          gap: Math.abs((row.level ?? 1) - level),
          rnd: Math.random(),
        }))
        .sort((a, b) => a.gap - b.gap || a.rnd - b.rnd)
        .slice(0, 3)
        .map(({ row }) => {
          const { note: _note, ...extras } = row.extras ?? {};
          return {
            title: row.title,
            scripts: row.scripts,
            tips: row.tips ?? [],
            extras,
          };
        });
    }

    // 7-1. 생성 이력 저장 (로그인 사용자만, 실패해도 화면은 유지)
    async function saveGeneration(params: {
      presetId: number | null;
      conditions: Record<string, unknown>;
      source: string;
      errorCode: string | null;
      results: ResultItem[];
    }): Promise<boolean> {
      try {
        const { data: { user } } = await userClient.auth.getUser();
        if (!user) return false;

        const { data: gen, error: genError } = await userClient
          .from("generations")
          .insert({
            user_id: user.id,
            preset_id: params.presetId,
            format_code,
            conditions: params.conditions,
            status: params.results.length > 0 ? "succeeded" : "failed",
            source: params.source,
            model: params.source === "ai" ? "alan" : null,
            error_code: params.errorCode,
            latency_ms: Date.now() - startedAt,
          })
          .select("id")
          .single();

        if (genError || !gen) {
          console.log("generations insert 실패:", genError);
          return false;
        }

        if (params.results.length === 0) return true;

        const items = params.results.slice(0, 3).map((r, i) => ({
          generation_id: gen.id,
          position: i + 1,
          title: r.title ?? "",
          scripts: r.scripts ?? [],
          tips: r.tips ?? [],
          extras: r.extras ?? {},
        }));

        const { error: itemError } = await userClient
          .from("generation_items")
          .insert(items);

        if (itemError) {
          console.log("generation_items insert 실패:", itemError);
          return false;
        }

        return true;
      } catch (e) {
        console.log("saveGeneration 예외:", e);
        return false;
      }
    }

    try {
      // 8. 프리셋 조건 조회
      const { data: preset } = (await db
        .from("presets")
        .select("id, title, conditions")
        .eq("code", preset_code)
        .eq("is_active", true)
        .single()) as { data: PresetRow | null };

      if (!preset) {
        return jsonResponse(
          {
            error: "preset_not_found",
            detail: `없는 프리셋입니다: ${preset_code}`,
          },
          400,
        );
      }

      // 9. 조건 코드를 한글 라벨로 변환
      const cond = preset.conditions ?? {};
      const { data: options } = (await db
        .from("options")
        .select("category, code, label")) as { data: OptionRow[] | null };

      const labelOf = (category: string, code?: string) =>
        options?.find((o) => o.category === category && o.code === code)
          ?.label ?? null;

      const situation = labelOf("situation", cond.situation) ?? preset.title;
      const relation = labelOf("relation", cond.relation);
      const target = labelOf("target", cond.target);
      const mood = labelOf("mood", cond.mood);
      const formatLabel = labelOf("format", format_code) ?? format_code;

      // 저장에 함께 남길 조건 스냅샷
      const snapshot = { ...cond, level };

      // 폴백 응답 + 저장을 한 번에 처리
      const fallbackResponse = async (reason: string, extra = {}) => {
        const results = await getFallback();
        const saved = await saveGeneration({
          presetId: preset.id,
          conditions: snapshot,
          source: "fallback",
          errorCode: reason,
          results,
        });
        return jsonResponse({
          source: "fallback",
          reason,
          saved,
          meta: { situation, format: formatLabel, level, mood },
          results,
          ...extra,
        });
      };

      // 10. 앨런 이전 대화 상태 초기화
      await fetch(`${ALAN_BASE}/reset-state`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: ALAN_CLIENT_ID }),
      });

      // 11. 조건으로 프롬프트 조립
      const who = [relation, target].filter(Boolean).join(" · ");
      const prompt = [
        `${situation} 상황에서 ${
          who ? who + "와 " : ""
        }함께할 ${formatLabel} 3개를 만들어줘.`,
        mood ? `분위기는 ${mood}.` : "",
        `깊이는 ${LEVEL_RULE[level]}.`,
        FORMAT_RULE[format_code],
        "검색하지 말고 직접 창작해. 출처나 링크 붙이지 마.",
        "별표나 마크다운 문법 쓰지 말고 순수 텍스트로만 써.",
        "위 지시 내용을 결과 문장에 그대로 옮겨 적지 마.",
        "아래 JSON 형식만 출력. 설명이나 인사말 금지.",
        `{"results":[{"title":"주제","scripts":["내용"],"tips":["팁1","팁2"],"extras":{}}]}`,
        format_code === "penalty"
          ? "results는 3개."
          : "results는 3개, 각 tips는 2개.",
        `금지 소재: ${BANNED[preset_code] ?? "정치, 종교, 외모 평가"}`,
      ].filter(Boolean).join("\n");

      // 12. 앨런 AI로 대화 소재 생성
      const alanResponse = await fetch(
        `${ALAN_BASE}/question?content=${encodeURIComponent(prompt)}` +
          `&client_id=${ALAN_CLIENT_ID}`,
      );

      // 13. 앨런 호출 오류 확인
      if (!alanResponse.ok) {
        return await fallbackResponse("alan_request_failed", {
          status: alanResponse.status,
        });
      }

      const alanJson = await alanResponse.json();
      const answer: string = alanJson?.answer ?? "";

      // 14. 응답에서 JSON 부분만 추출
      const match = answer.match(/\{[\s\S]*\}/);
      if (!match) {
        return await fallbackResponse("alan_json_not_found");
      }

      // 15. JSON 파싱 오류 확인
      let parsed;
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        return await fallbackResponse("alan_json_parse_failed");
      }

      // 16. 결과 개수 검증
      const results: ResultItem[] = Array.isArray(parsed?.results)
        ? parsed.results
        : [];
      if (results.length === 0) {
        return await fallbackResponse("alan_empty_results");
      }

      // 17. 생성 이력 저장 후 결과 반환
      const saved = await saveGeneration({
        presetId: preset.id,
        conditions: snapshot,
        source: "ai",
        errorCode: null,
        results,
      });

      return jsonResponse({
        source: "ai",
        saved,
        meta: { situation, format: formatLabel, level, mood },
        results,
      });
    } catch (error) {
      // 18. 예상치 못한 오류 — 폴백으로 화면은 유지
      console.log(error);
      return jsonResponse({
        source: "fallback",
        reason: "server_error",
        detail: error instanceof Error ? error.message : String(error),
        results: await getFallback(),
      });
    }
  }),
};
