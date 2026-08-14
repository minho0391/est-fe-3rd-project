// 로그인 화면은 robots.js 에서도 색인 제외 대상입니다.
export const metadata = {
  title: "로그인",
  robots: { index: false, follow: false },
};

export default function SignInLayout({ children }) {
  return children;
}
