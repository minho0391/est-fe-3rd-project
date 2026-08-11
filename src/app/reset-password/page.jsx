"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "@/auth/auth.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { updateUserPassword } from "@/utils/supabase/auth";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
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
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    try {
      await updateUserPassword(password);
      setSuccess(true);
    } catch {
      setError(
        "비밀번호 변경에 실패했습니다. 재설정 링크가 만료되었을 수 있어요. 다시 시도해 주세요.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <Header />
      <main className="reset-main">
        <section className="reset-card" aria-label="새 비밀번호 설정">
          <div className="reset-heading">
            <h1 className="reset-title">새 비밀번호 설정</h1>
            <p className="reset-desc">사용하실 새 비밀번호를 입력해 주세요.</p>
          </div>

          {error && <p className="reset-alert reset-alert-error">{error}</p>}

          {success ? (
            <>
              <p className="reset-alert reset-alert-success">
                비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.
              </p>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => router.push("/sign-in")}
                fullWidth
              >
                로그인하러 가기
              </Button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="reset-form">
              <div className="reset-field">
                <label className="reset-label" htmlFor="reset-password">
                  새 비밀번호
                </label>
                <input
                  id="reset-password"
                  type="password"
                  placeholder="새 비밀번호를 입력하세요"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="reset-input"
                  autoComplete="new-password"
                />
              </div>
              <div className="reset-field">
                <label className="reset-label" htmlFor="reset-password-confirm">
                  새 비밀번호 확인
                </label>
                <input
                  id="reset-password-confirm"
                  type="password"
                  placeholder="새 비밀번호를 다시 입력하세요"
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  required
                  className="reset-input"
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" variant="primary" size="md" disabled={loading} fullWidth>
                {loading ? "변경 중..." : "비밀번호 변경"}
              </Button>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
