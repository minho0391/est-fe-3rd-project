// 비밀번호 재설정은 메일 링크로 들어오는 화면이라 색인 대상이 아닙니다.
export const metadata = {
  title: "비밀번호 재설정",
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }) {
  return children;
}
