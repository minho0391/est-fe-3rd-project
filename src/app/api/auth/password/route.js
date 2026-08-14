// 비밀번호 변경 API - 이메일 가입 계정의 현재 비밀번호 확인 및 비밀번호 변경 처리
import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

const hasEmailProvider = user => {
  const provider = user?.app_metadata?.provider;
  const providers = user?.app_metadata?.providers;

  return (
    provider === "email" ||
    (Array.isArray(providers) && providers.includes("email"))
  );
};

const errorResponse = (message, status) =>
  NextResponse.json({ ok: false, message }, { status });

export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return errorResponse("로그인이 필요합니다.", 401);
    }

    // 클라이언트의 provider 값은 신뢰하지 않고 서버가 Auth 사용자 객체를 다시 확인합니다.
    if (!hasEmailProvider(user)) {
      return errorResponse(
        "이메일 가입 계정에서만 비밀번호를 변경할 수 있습니다.",
        403,
      );
    }

    if (!user.email) {
      return errorResponse("이메일 정보를 확인할 수 없습니다.", 400);
    }

    const body = await request.json().catch(() => null);
    const action = body?.action;
    const currentPassword = body?.currentPassword;
    const newPassword = body?.newPassword;

    if (!currentPassword || typeof currentPassword !== "string") {
      return errorResponse("현재 비밀번호를 입력해 주세요.", 400);
    }

    // 비밀번호 검증은 현재 요청의 쿠키 기반 서버 클라이언트와 분리합니다.
    // signInWithPassword는 새 세션을 발급하므로 같은 클라이언트에서 실행하면
    // 확인/저장 요청 사이에 인증 쿠키가 교체되어 연속 요청이 실패할 수 있습니다.
    const verifier = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );

    const { error: reauthError } = await verifier.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (reauthError) {
      return errorResponse("현재 비밀번호가 일치하지 않습니다.", 400);
    }

    if (action === "verify") {
      return NextResponse.json({ ok: true });
    }

    if (action !== "change") {
      return errorResponse("잘못된 요청입니다.", 400);
    }

    if (
      !newPassword ||
      typeof newPassword !== "string" ||
      newPassword.length < 6
    ) {
      return errorResponse("새 비밀번호는 6자 이상 입력해 주세요.", 400);
    }

    if (currentPassword === newPassword) {
      return errorResponse(
        "새 비밀번호는 현재 비밀번호와 다르게 입력해 주세요.",
        400,
      );
    }

    // 재인증 이후에도 서버에서 provider를 다시 확인한 사용자 세션으로만 변경합니다.
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error("[auth] 비밀번호 변경 실패:", updateError);
      return errorResponse(
        "비밀번호 변경에 실패했습니다. 다시 시도해 주세요.",
        400,
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[auth] 비밀번호 변경 API 오류:", error);
    return errorResponse("비밀번호 처리 중 오류가 발생했습니다.", 500);
  }
}
