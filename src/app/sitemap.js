import { SITE_URL } from "@/lib/site";

// 이번 범위(메인 + 게임)만 등록했습니다.
// 커뮤니티·generate 는 해당 페이지 SEO 작업할 때 여기에 줄만 추가하면 됩니다.
const routes = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/game/card-game", priority: 0.7, changeFrequency: "monthly" },
  { path: "/game/random-pick", priority: 0.7, changeFrequency: "monthly" },
  { path: "/game/chosung-quiz", priority: 0.7, changeFrequency: "monthly" },
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
