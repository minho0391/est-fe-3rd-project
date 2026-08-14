import { SITE_URL } from "@/lib/site";

// 로그인·개인 화면과 생성 결과 페이지는 robots.js 에서 색인 제외했으므로 여기서도 뺍니다.
const routes = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/generate", priority: 0.9, changeFrequency: "weekly" },
  { path: "/post", priority: 0.8, changeFrequency: "daily" },
  { path: "/post/list", priority: 0.8, changeFrequency: "daily" },
  { path: "/formats", priority: 0.7, changeFrequency: "monthly" },
  { path: "/game/card-game", priority: 0.7, changeFrequency: "monthly" },
  { path: "/game/random-pick", priority: 0.7, changeFrequency: "monthly" },
  { path: "/game/chosung-quiz", priority: 0.7, changeFrequency: "monthly" },
  { path: "/sign-up", priority: 0.5, changeFrequency: "yearly" },
];

export default function sitemap() {
  const lastModified = new Date();

  return routes.map(route => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
