import { useState } from 'react'
import { Link } from 'react-router-dom'
import PromoPanel from '../components/PromoPanel'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    // TODO: 실제 로그인 API 연동
  }

  return (
    <div className="page">
      <main className="login-container">
        <section className="login-card" onSubmit={handleSubmit}>
          <label className="login-field">
            <span className="login-label">이메일 주소</span>
            <input
              type="email"
              className="login-input"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="login-field">
            <span className="login-label">비밀번호</span>
            <input
              type="password"
              className="login-input"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <Link to="#" className="login-passwordLink">
            비밀번호 찾기
          </Link>

          <button type="submit" className="login-primaryBtn">
            이메일로 로그인
          </button>
          <button type="button" className="login-primaryBtn">
            Google 로그인
          </button>
        </section>

        <PromoPanel />
      </main>
    </div>
  );
}