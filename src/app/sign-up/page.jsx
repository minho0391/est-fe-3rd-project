"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "@/auth/auth.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { CasinoIcon } from "@/images/icons";
import { signUpWithEmail, signInWithGoogle } from "@/utils/supabase/auth";

const NICKNAME_ADJECTIVES = ["즐거운", "다정한", "용감한", "차분한", "엉뚱한", "든든한", "활기찬", "따뜻한"];
const NICKNAME_NOUNS = ["고양이", "여우", "펭귄", "다람쥐", "부엉이", "호랑이", "너구리", "판다"];

const generateRandomNickname = () => {
  const adjective = NICKNAME_ADJECTIVES[Math.floor(Math.random() * NICKNAME_ADJECTIVES.length)];
  const noun = NICKNAME_NOUNS[Math.floor(Math.random() * NICKNAME_NOUNS.length)];
  const number = Math.floor(Math.random() * 900) + 100;
  return `${adjective}${noun}${number}`;
};

export default function SignUpPage() {
  const router = useRouter();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    try {
      const data = await signUpWithEmail({ email, password, nickname });

      if (data.session) {
        router.push("/");
        router.refresh();
      } else {
        setSuccess(true);
      }
    } catch (error) {
      setError(
        error.message === "User already registered"
          ? "이메일이 중복됩니다."
          : "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    try {
      await signInWithGoogle("/");
    } catch (error) {
      setError("구글 회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  return (
    <div className="signup-page">
      <Header />

      <main className="signup-main">
        <section className="signup-card" aria-label="회원가입">
          {error && <p className="signup-alert signup-alert-error">{error}</p>}

          {success ? (
            <p className="signup-alert signup-alert-success">
              가입 확인 메일을 보냈습니다. 메일함에서 인증 링크를 확인해 주세요.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="signup-form">
              <div className="signup-field">
                <label className="signup-label" htmlFor="signup-nickname">
                  닉네임
                </label>
                <div className="signup-nicknameRow">
                  <input
                    id="signup-nickname"
                    type="text"
                    placeholder="닉네임을 입력하세요"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    required
                    className="signup-input"
                    autoComplete="nickname"
                  />
                  <button
                    type="button"
                    aria-label="닉네임 무작위 생성"
                    onClick={() => setNickname(generateRandomNickname())}
                    className="signup-diceBtn"
                  >
                    <CasinoIcon fontSize="small" />
                  </button>
                </div>
              </div>

              <div className="signup-field">
                <label className="signup-label" htmlFor="signup-email">
                  이메일 주소
                </label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="signup-input"
                  autoComplete="email"
                />
              </div>

              <div className="signup-field">
                <label className="signup-label" htmlFor="signup-password">
                  비밀번호
                </label>
                <input
                  id="signup-password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="signup-input"
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" variant="primary" size="md" disabled={loading} fullWidth>
                {loading ? "가입 중..." : "회원가입"}
              </Button>
            </form>
          )}

          <Button variant="primary" size="md" onClick={handleGoogleSignUp} disabled={loading} fullWidth>
            Google로 회원가입
          </Button>

          <p className="signup-loginLink">
            이미 계정이 있으신가요? <Link href="/sign-in">로그인</Link>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}