import { supabase } from "@/lib/supabase";

export async function GET() {
  const email = `test${Date.now()}@gmail.com`;
  const password = "test1234!";

  const { data: signUp, error: e1 } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nickname: "테스트유저" } },
  });
  if (e1) {
    return Response.json(
      {
        step: "signUp",
        message: e1.message,
        name: e1.name,
        status: e1.status,
        code: e1.code,
        full: JSON.parse(JSON.stringify(e1, Object.getOwnPropertyNames(e1))),
      },
      { status: 400 },
    );
  }
  const { data: profile, error: e2 } = await supabase
    .from("profiles")
    .select("id, nickname, role, created_at")
    .eq("id", signUp.user.id)
    .single();

  return Response.json({
    email,
    user_id: signUp.user?.id,
    session: signUp.session ? "있음" : "없음(이메일 확인 필요)",
    profile: profile ?? null,
    profileError: e2?.message ?? null,
  });
}
