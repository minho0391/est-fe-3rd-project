// 사이트 주소 : http://localhost:3000/generate/result

// 생성 결과 화면 , loading/page.jsx 에서 생성 성공 시 넘어 오게 됨.

//import 요소 정리
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Box, Typography } from "@mui/material";

export default function GenerateResultPage() {
  return (
    <>
      <Header />
      <h1>생성 결과 페이지</h1>
      <Box>
        {" "}
        {/* page */}
        <Box>
          {" "}
          {/* container */}
          <Box>
            {" "}
            {/* header container */}
            <Box>
              {" "}
              {/* icon */}
              {/* icon img 파일 svg 로드 Box component="img" ... */}
            </Box>
            <Typography>{/* title */}</Typography>
            <Typography>{/* subtitle */}</Typography>
          </Box>
          <Box>
            {" "}
            {/* topic 1,2 용 */}
            <Box />
            {/* Topic 1 */}
            <Box />
            {/* Topic 2 */}
          </Box>
          <Box>
            {" "}
            {/* topic 3 용 */}
            <Box /> {/* Topic 3 */}
          </Box>
          <Box>
            {" "}
            {/* footer container */}
            <Box>
              <Typography>이 가이드가 마음에 드시나요?</Typography>
              <Typography>가이드를 저장하고 실제 상황에서 바로 꺼내보세요.</Typography>
            </Box>
            <Box>
              {" "}
              {/* CTA */}
              {/* Button - 다른 주제 생성 / 가이드 저장 */}
              <Button>다른 주제 생성하기</Button>
              <Button>가이드 저장하기</Button>
            </Box>
          </Box>
        </Box>
      </Box>
      <Footer />
    </>
  );
}
