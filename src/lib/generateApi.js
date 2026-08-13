import { createClient } from "@/utils/supabase/client";

/**
 * 대화 가이드 생성 (Supabase Edge Function "generate" 호출).
 *
 * 로그인 상태면 supabase-js가 Authorization 헤더를 자동으로 붙여주므로
 * 별도 처리 없이 로그인/비로그인 모두 동일하게 호출하면 된다.
 *
 * @param {object} payload
 *   {
 *     preset_code?: string,
 *     format_code: string,
 *     level?: 1 | 2 | 3,
 *     conditions?: { situation?, relation?, target?, mood? },
 *     overrides?: { situation?, relation?, target?, mood? },
 *   }
 * @returns {Promise<{
 *   source: "ai" | "fallback",
 *   saved: boolean,
 *   generationId: number | null,
 *   meta: { situation: string, format: string, level: number, mood: string | null },
 *   results: Array<{ id: number | null, title: string, scripts: string[], tips: string[], extras: object }>,
 * }>}
 */
export async function generateGuide(payload) {
  const supabase = createClient();

  const { data, error } = await supabase.functions.invoke("generate", {
    body: payload,
  });

  if (error) {
    // FunctionsHttpError의 error.message는 보통 의미 없는 문자열이고,
    // 실제 실패 사유는 error.context(Response)의 body 안에 JSON으로 들어있다.
    let detail = null;
    try {
      detail = await error.context?.json();
    } catch {
      /* body가 JSON이 아닐 수도 있음 */
    }
    console.error("generateGuide 실패:", { payload, status: error.context?.status, detail, error });
    // message 는 사용자에게 보여줄 한글 문구, error 는 기계용 코드다.
    // 레이트리밋(429)처럼 안내 문구가 있는 응답은 그 문구를 그대로 쓴다.
    throw new Error(
      detail?.message ?? detail?.error ?? error.message ?? "대화 가이드 생성에 실패했습니다.",
    );
  }

  return data;
}
