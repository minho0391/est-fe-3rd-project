"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import "@/auth/auth.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { signInWithEmail, signInWithGoogle, resetPassword } from "@/utils/supabase/auth";

const PROMO_BULLETS = [
  "AI 맞춤 콘텐츠 생성",
  "나의 콘텐츠와 활동 관리",
  "AI 콘텐츠 공유 및 게시글 작성",
  "좋아요 및 댓글 참여",
];

function PromoPanel() {
  return (
    <aside className="signin-promo" aria-label="Momentalk 소개">
      <div className="signin-promoHeading">
        <h2 className="signin-promoTitle">Momentalk의 다양한 콘텐츠를 만나보세요</h2>
        <p className="signin-promoDesc">
          로그인하면 AI를 활용해 나만의 대화 콘텐츠를 저장하고 공유할 수 있어요
        </p>
      </div>

      <ul className="signin-promoBullets">
        {PROMO_BULLETS.map(bullet => (
          <li key={bullet} className="signin-promoBullet">
            • {bullet}
          </li>
        ))}
      </ul>

      <Button component={Link} href="/sign-up" variant="primary" size="md" fullWidth>
        회원가입
      </Button>
    </aside>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const authFailed = searchParams.get("error") === "auth_failed";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    authFailed ? "인증에 실패했습니다. 다시 시도해 주세요." : "",
  );
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      await signInWithEmail({ email, password });
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(
        err.message === "Invalid login credentials"
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setNotice("");
    try {
      await signInWithGoogle(next);
    } catch {
      setError("구글 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  const handleFindPassword = async () => {
    setError("");
    setNotice("");

    if (!email) {
      setError("비밀번호를 재설정할 이메일을 먼저 입력해 주세요.");
      return;
    }

    try {
      await resetPassword(email);
      setNotice("비밀번호 재설정 메일을 보냈습니다. 메일함을 확인해 주세요.");
    } catch {
      setError("비밀번호 재설정 메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  return (
    <div className="signin-layout">
      <section className="signin-section" aria-label="이메일로 로그인">
        {error && <p className="signin-alert signin-alert-error">{error}</p>}
        {notice && <p className="signin-alert signin-alert-success">{notice}</p>}

        <form onSubmit={handleSubmit} className="signin-form">
          <div className="signin-field">
            <label className="signin-label" htmlFor="signin-email">
              이메일 주소
            </label>
            <input
              id="signin-email"
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="signin-input"
              autoComplete="email"
            />
          </div>

          <div className="signin-field">
            <label className="signin-label" htmlFor="signin-password">
              비밀번호
            </label>
            <input
              id="signin-password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="signin-input"
              autoComplete="current-password"
            />
          </div>

          <button type="button" onClick={handleFindPassword} className="signin-findPasswordLink">
            비밀번호 찾기
          </button>

          <Button type="submit" variant="primary" size="md" disabled={loading} fullWidth>
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        <Button variant="primary" size="md" onClick={handleGoogleSignIn} fullWidth>
          Google 로그인
        </Button>
      </section>

      <PromoPanel />
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="signin-page">
      <Header />

      <main className="signin-main">
        <Suspense fallback={null}>
          <SignInForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
