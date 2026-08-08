import { createClient } from "@/utils/supabase/server";
import { askAlan, toAlanResponse, AlanError } from "@/lib/alan";

/** 조건 라벨을 사람이 읽는 문장으로 조립 */
const buildPrompt = ({ situation, mood, relation, target, format }) => {
  const conditions = [
    situation && `상황: ${situation}`,
    mood && `원하는 분위기: ${mood}`,
    relation && `관계: ${relation}`,
    target && `대화 상대: ${target}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `아래 조건에 맞는 "${format}" 형식의 대화 카드 3개를 만들어줘.

${conditions}

카드 하나에 내용은 딱 1개. 여러 개 넣지 마.
검색하지 말고 직접 창작해. 출처나 링크 붙이지 마.
아래 JSON 형식만 출력. 설명이나 인사말 금지.
{"results":[{"title":"주제","scripts":["내용 1개"],"tips":["팁1","팁2"]}]}
results는 3개, 각 scripts는 1개, 각 tips는 2개.
금지 소재: 연봉, 인사평가, 승진, 사내정치, 사생활, 음주강요, 정치, 종교`;
};

/**
 * 대화 가이드 생성.
 *
 * 로그인 사용자는 generations / generation_items 에 저장하고 generationId 를 함께 반환합니다.
 * 비로그인 사용자도 생성은 가능하며, 이 경우 저장 없이 결과만 돌려줍니다.
 */
export async function POST(req) {
  try {
    const db = await createClient();

    const {
      data: { user },
    } = await db.auth.getUser();

    const { situation, mood, relation, target, format, presetId } = await req.json();

    if (!situation?.trim()) {
      return Response.json({ source: "failed", error: "상황을 입력해주세요." }, { status: 400 });
    }

    if (!format) {
      return Response.json({ source: "failed", error: "형식을 선택해주세요." }, { status: 400 });
    }

    const conditions = { situation, mood, relation, target };

    // 로그인 사용자만 생성 이력을 남깁니다.
    let generationId = null;

    if (user) {
      const { data: generation, error } = await db
        .from("generations")
        .insert({
          user_id: user.id,
          preset_id: presetId ?? null,
          format_code: format,
          conditions,
          custom_input: situation,
          status: "running",
          model: "alan",
        })
        .select("id")
        .single();

      if (error) throw error;
      generationId = generation.id;
    }

    const markFailed = async errorCode => {
      if (!generationId) return;

      await db
        .from("generations")
        .update({ status: "failed", error_code: errorCode })
        .eq("id", generationId);
    };

    // 앨런 호출
    const startedAt = Date.now();
    let result;

    try {
      result = await askAlan(buildPrompt({ situation, mood, relation, target, format }));
    } catch (error) {
      await markFailed(error instanceof AlanError ? String(error.status) : "unknown");
      throw error;
    }

    const latencyMs = Date.now() - startedAt;
    const results = Array.isArray(result?.results) ? result.results : [];

    if (results.length === 0) {
      await markFailed("empty_result");
      throw new AlanError("앨런이 결과를 만들지 못했습니다.");
    }

    const normalized = results.map((item, index) => ({
      position: index + 1,
      title: item.title ?? "",
      scripts: Array.isArray(item.scripts) ? item.scripts : [],
      tips: Array.isArray(item.tips) ? item.tips : [],
    }));

    // 비로그인은 저장 없이 결과만 반환합니다.
    if (!generationId) {
      return Response.json({
        source: "ai",
        generationId: null,
        conditions,
        formatCode: format,
        results: normalized,
      });
    }

    const { data: saved, error: itemError } = await db
      .from("generation_items")
      .insert(normalized.map(item => ({ ...item, generation_id: generationId })))
      .select("id, position, title, scripts, tips")
      .order("position");

    if (itemError) {
      await markFailed("db_insert_failed");
      throw itemError;
    }

    await db
      .from("generations")
      .update({ status: "succeeded", latency_ms: latencyMs })
      .eq("id", generationId);

    return Response.json({
      source: "ai",
      generationId,
      conditions,
      formatCode: format,
      results: saved,
    });
  } catch (error) {
    return toAlanResponse(error);
  }
}
