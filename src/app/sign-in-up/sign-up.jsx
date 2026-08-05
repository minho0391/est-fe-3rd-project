export default function Signup() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSignup = (e) => { e.preventDefault();
  if (!nickname || !email || !password) {
    alert("모든 항목을 입력해주세요."); 
    return;}

    console.log({ nickname, email, password, }); }; 
    return ( 
      <>
      <div className="signup-page">
        <main className="signup-main">
          <section className="signup-card" onSubmit={handleSignup}>
            <div className="form-group">
              <label htmlFor="nickname">닉네임</label>
              <input
                id="nickname"
                type="text"
                placeholder="닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
          </div>
          <div className="form-group">
            <label htmlFor="email">이메일 주소</label>
            <input
              id="email"
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="signup-button">
            회원가입
          </button>
          <button type="button" className="google-button">
            Google
          </button>
        </section>
        {showModal && (
          <div className="modal-overlay">
            <div className="signup-modal">
              <h2>이메일이 중복됩니다</h2>

              <button onClick={() => setShowModal(false)}>
                뒤로가기
              </button>
            </div>
          </div>
        )}
      </main>
      </div>
    
      </>
      );
     } 