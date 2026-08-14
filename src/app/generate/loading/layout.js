// 생성 진행 화면이라 색인 대상이 아닙니다.
export const metadata = {
  title: "대화 소재 생성 중",
  robots: { index: false, follow: false },
};

export default function GenerateLoadingLayout({ children }) {
  return children;
}
