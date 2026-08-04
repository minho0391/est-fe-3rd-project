//로딩 진행 중 화면 + 생성 실패 화면 같은 라우트, 상태로 전환
// 로딩 실패 시 result/page.jsx로 넘어가지 않고 실패 시 화면

//import 요소 정리
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function GenerateLoadingPage() {
  return (
    <>
      <Header />
      <h1>로딩 안내 페이지</h1>
      <Footer />
    </>
  );
}
