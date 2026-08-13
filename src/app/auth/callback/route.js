import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // 로그인 후 돌아갈 경로 (기본은 홈)
  const returnUrl = searchParams.get("returnUrl") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${returnUrl}`);
    }
    console.error("[auth/callback] 세션 교환 실패:", error);
  }

  // 실패 시 로그인 화면으로
  return NextResponse.redirect(`${origin}/sign-in?error=auth_failed`);
}
