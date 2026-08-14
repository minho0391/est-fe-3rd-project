// 로그인 사용자 전용 화면이라 색인 대상이 아닙니다.
export const metadata = {
  title: "글쓰기",
  robots: { index: false, follow: false },
};

export default function PostWriteLayout({ children }) {
  return children;
}
