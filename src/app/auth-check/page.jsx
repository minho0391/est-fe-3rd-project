"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { signInWithGoogle, signOut } from "@/utils/supabase/auth";

export default function AuthCheckPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user ?? null),
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <p style={{ padding: 40 }}>확인 중...</p>;

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Auth 연동 테스트</h1>

      {user ? (
        <>
          <p>로그인 상태입니다.</p>
          <pre style={{ background: "#f4f4f4", padding: 16, fontSize: 13 }}>
            {JSON.stringify(
              {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name,
                provider: user.app_metadata?.provider,
              },
              null,
              2,
            )}
          </pre>
          <button onClick={() => signOut()}>로그아웃</button>
        </>
      ) : (
        <>
          <p>로그인되어 있지 않습니다.</p>
          <button onClick={() => signInWithGoogle("/auth-check")}>Google 로그인</button>
        </>
      )}
    </div>
  );
}
