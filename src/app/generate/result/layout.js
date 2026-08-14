// 생성 결과는 요청마다 내용이 달라 색인 대상이 아닙니다.
export const metadata = {
  title: "생성된 대화 가이드",
  robots: { index: false, follow: false },
};

export default function GenerateResultLayout({ children }) {
  return children;
}
