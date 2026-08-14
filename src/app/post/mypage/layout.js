// 개인 화면이라 색인 대상이 아닙니다.
export const metadata = {
  title: "마이페이지",
  robots: { index: false, follow: false },
};

export default function MypageLayout({ children }) {
  return children;
}
