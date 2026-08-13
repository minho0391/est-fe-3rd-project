import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/lib/theme";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, OG_IMAGE } from "@/lib/site";
import "./globals.css";

export const metadata = {
  // 상대 경로 이미지(/og-image.png)를 절대 URL 로 바꿔주는 기준입니다.
  metadataBase: new URL(SITE_URL),

  // default: 메인처럼 자체 title 이 없는 페이지에 쓰입니다.
  // template: 하위 페이지 title 이 "카드 뒤집기 | Momentalk" 형태가 됩니다.
  title: {
    default: `${SITE_NAME} — AI 대화 소재 추천`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["대화 소재", "아이스브레이킹", "모임 게임", "밸런스 게임", "AI 추천"],

  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ko_KR",
    url: SITE_URL,
    title: `${SITE_NAME} — AI 대화 소재 추천`,
    description: SITE_DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} 대표 이미지` }],
  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — AI 대화 소재 추천`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <AppRouterCacheProvider options={{ key: "mui" }}>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
