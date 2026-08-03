import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const ALAN = "https://kdt-api-function.azurewebsites.net/api/v1";
const CLIENT_ID = Deno.env.get("ALAN_CLIENT_ID");

export default {
  fetch: withSupabase({ auth: ["publishable"] }, async (req, ctx) => {
    const { preset_code = "dinner", format_code = "question", level = 1 } =
      await req.json().catch(() => ({}));

    // ── 폴백: default_contents에서 3개 뽑기 ──
    async function getFallback() {
      const { data } = await ctx.supabase
        .from("default_contents")
        .select("title, scripts, tips, extras")
        .eq("is_active", true)
        .eq("preset_code", preset_code)
        .eq("format_code", format_code)
        .limit(30);

      if (!data?.length) return [];
      // 요청 레벨에 가까운 순 → 그 안에서 무작위 → 3개
      return data.sort(() => Math.random() - 0.5).slice(0, 3);
    }

    try {
      await fetch(`${ALAN}/reset-state`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: CLIENT_ID }),
      });

      const prompt = `회식에서 직장 동료와 나눌 대화 질문 3개를 만들어줘.
카드 하나에 질문은 딱 1개. 여러 개 넣지 마.
검색하지 말고 직접 창작해. 출처나 링크 붙이지 마.
아래 JSON 형식만 출력. 설명이나 인사말 금지.
{"results":[{"title":"주제","scripts":["질문 1개"],"tips":["팁1","팁2"]}]}
results는 3개, 각 scripts는 1개, 각 tips는 2개.
금지 소재: 연봉, 인사평가, 승진, 사내정치, 사생활, 음주강요, 정치, 종교`;

      const res = await fetch(
        `${ALAN}/question?content=${
          encodeURIComponent(prompt)
        }&client_id=${CLIENT_ID}`,
      );
      const data = await res.json();
      const match = data.answer?.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("JSON 없음");

      return Response.json({ source: "ai", ...JSON.parse(match[0]) });
    } catch (_e) {
      const results = await getFallback();
      return Response.json({ source: "fallback", results });
    }
  }),
};
