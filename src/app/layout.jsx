import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/lib/theme";
import "./globals.css";

export const metadata = {
  title: "Momentalk",
  description: "어떤 모임에 어떤 분위기든, 고르기만 하면 AI가 대화 소재를 뽑아 드려요.",
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
