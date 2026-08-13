/**
 * 앨런 호출 레이트리밋.
 *
 * supabase/generation-rate-limit.sql 의 check_generation_rate_limit RPC 를 호출합니다.
 * 로그인 사용자만 제한하며, 비로그인은 generations 에 저장되지 않아 항상 통과합니다.
 *
 * 반드시 서버(API Route / Edge Function)에서 호출하세요.
 * 브라우저에서 부르면 우회할 수 있어 제한 의미가 없습니다.
 */

import { createClient } from "@/utils/supabase/client";

/**
 * @param {object} [options]
 * @param {number} [options.perMinute=5] 1분당 허용 건수
 * @param {number} [options.perDay=50] 24시간당 허용 건수
 * @returns {Promise<{allowed: boolean, reason?: string, message?: string, retryAfterSeconds?: number}>}
 */
export const checkGenerationRateLimit = async ({ perMinute, perDay } = {}) => {
  const params = {};
  if (perMinute !== undefined) params.p_per_minute = perMinute;
  if (perDay !== undefined) params.p_per_day = perDay;

  const { data, error } = await createClient().rpc("check_generation_rate_limit", params);

  // 제한 확인 자체가 실패했다고 생성을 막지는 않습니다.
  if (error) {
    console.warn("레이트리밋 확인 실패:", error);
    return { allowed: true };
  }

  return data;
};
