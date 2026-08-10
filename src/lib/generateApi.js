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
    throw new Error(error.message ?? "대화 가이드 생성에 실패했습니다.");
  }

  return data;
}
