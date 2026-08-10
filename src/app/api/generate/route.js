import { createClient } from "@/utils/supabase/server";
import {
  ALAN_TASK,
  AlanError,
  generateAlanContent,
  toAlanResponse,
} from "@/lib/alan";

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

    const { situation, mood, relation, target, format, presetId } =
      await req.json();

    if (!situation?.trim()) {
      return Response.json(
        { source: "failed", error: "상황을 입력해주세요." },
        { status: 400 },
      );
    }

    if (!format) {
      return Response.json(
        { source: "failed", error: "형식을 선택해주세요." },
        { status: 400 },
      );
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
      const generated = await generateAlanContent(ALAN_TASK.CONVERSATION, {
        situation,
        mood,
        relation,
        target,
        format,
      });
      result = generated;
    } catch (error) {
      await markFailed(
        error instanceof AlanError ? String(error.status) : "unknown",
      );
      throw error;
    }

    const latencyMs = Date.now() - startedAt;
    const results = Array.isArray(result?.results) ? result.results : [];

    if (results.length === 0) {
      await markFailed("empty_result");
      throw new AlanError("앨런이 결과를 만들지 못했습니다.");
    }

    // generation_items.position 이 1~3 으로 제한돼 있어 앨런이 더 많이 반환해도 3개까지만 저장합니다.
    const normalized = results.slice(0, 3).map((item, index) => ({
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
      .insert(
        normalized.map(item => ({ ...item, generation_id: generationId })),
      )
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
