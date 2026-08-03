// [게시판 작성] 페이지 (localhost:3000/post/write)
import "./style.css";

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
