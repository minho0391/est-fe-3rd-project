// Supabase 인증 유틸리티 - 구글/이메일 로그인,
// 회원가입, 로그아웃 및 비밀번호 재설정·변경 처리
"use client";
import { createClient } from "@/utils/supabase/client";

// 구글 로그인 — 성공 후 /auth/callback 으로 돌아옴
export async function signInWithGoogle(returnUrl = "/") {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}`,
    },
  });
  if (error) {
    console.error("[auth] 구글 로그인 실패:", error);
    throw error;
  }
}

// 이메일 회원가입
export async function signUpWithEmail({ email, password, nickname }) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

// 이메일 로그인
export async function signInWithEmail({ email, password }) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

// 로그아웃
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// 비밀번호 재설정 메일 발송 — 메일 링크를 누르면 /reset-password 로 이동
export async function resetPassword(email) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?returnUrl=/reset-password`,
  });
  if (error) throw error;
  return data;
}

// 새 비밀번호로 변경 — /reset-password 에서 호출 (재설정 링크로 들어와 세션이 있는 상태여야 함)
export async function updateUserPassword(password) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

// 로그인 상태에서 현재 비밀번호 확인 — 서버에서 로그인 방식과 세션을 다시 검증합니다.
export async function verifyCurrentPassword({ currentPassword }) {
  const response = await fetch("/api/auth/password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "verify", currentPassword }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result?.message || "현재 비밀번호가 일치하지 않습니다.");
  }

  return true;
}

// 로그인 상태에서 비밀번호 변경 — 서버가 이메일 로그인 가능 여부를 재검증한 뒤 적용합니다.
export async function changePasswordWithReauth({
  currentPassword,
  newPassword,
}) {
  const response = await fetch("/api/auth/password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "change",
      currentPassword,
      newPassword,
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result?.message || "비밀번호 변경에 실패했습니다.");
  }

  return true;
}
