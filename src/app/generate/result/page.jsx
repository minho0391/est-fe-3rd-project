// 생성 결과 화면 , loading/page.jsx 에서 생성 성공 시 넘어 오게 됨.

//import 요소 정리
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function GenerateResultPage() {
  return (
    <>
      <Header />
      <h1>생성 결과 페이지</h1>
      <Footer />
    </>
  );
}
