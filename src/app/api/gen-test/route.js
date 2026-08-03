import { supabase } from "@/lib/supabase";

export async function GET() {
  // 1) 로그인
  const { data: auth, error: eLogin } = await supabase.auth.signInWithPassword({
    email: "test1785656147301@gmail.com",
    password: "test1234!",
  });
  if (eLogin) {
    return Response.json({ step: "login", error: eLogin.message }, { status: 400 });
  }

  const userId = auth.user.id;

  // 2) generations 한 건
  const { data: gen, error: e1 } = await supabase
    .from("generations")
    .insert({
      user_id: userId,
      format_code: "question",
      conditions: { situation: "dinner", relation: "work", target: "coworker" },
      status: "succeeded",
      source: "ai",
      model: "alan",
    })
    .select()
    .single();
  if (e1) {
    return Response.json({ step: "generations", error: e1.message }, { status: 400 });
  }

  // 3) generation_items 3건
  const items = [1, 2, 3].map(position => ({
    generation_id: gen.id,
    position,
    title: `테스트 주제 ${position}`,
    scripts: [`테스트 질문 ${position}`],
    tips: ["팁1", "팁2"],
  }));

  const { data: saved, error: e2 } = await supabase.from("generation_items").insert(items).select();
  if (e2) {
    return Response.json({ step: "items", error: e2.message }, { status: 400 });
  }

  // 4) 첫 번째를 saved_contents에 담기
  const first = saved[0];
  const { data: savedContent, error: e3 } = await supabase
    .from("saved_contents")
    .insert({
      user_id: userId,
      generation_item_id: first.id,
      format_code: "question",
      conditions: { situation: "dinner", relation: "work", target: "coworker" },
      title: first.title,
      scripts: first.scripts,
      tips: first.tips,
      memo: "테스트 저장",
    })
    .select()
    .single();
  if (e3) {
    return Response.json({ step: "saved", error: e3.message }, { status: 400 });
  }

  return Response.json({ user_id: userId, generation: gen, items: saved, savedContent });
}
