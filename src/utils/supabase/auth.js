"use client";

import { createClient } from "@/utils/supabase/client";

// 구글 로그인 — 성공 시 /auth/callback 으로 돌아옴
export async function signInWithGoogle(next = "/") {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
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
