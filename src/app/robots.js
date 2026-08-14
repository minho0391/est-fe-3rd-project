import { SITE_URL } from "@/lib/site";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 로그인·개인 화면과 결과 페이지는 색인 대상이 아닙니다.
      disallow: [
        "/api/",
        "/auth/",
        "/sign-in",
        "/reset-password",
        "/post/write",
        "/post/mypage",
        "/post/admin",
        "/generate/loading",
        "/generate/result",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
