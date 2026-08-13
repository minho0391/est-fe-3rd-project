// 사이트 공통 정보
// metadataBase, sitemap, robots 가 같은 도메인을 쓰므로 여기 한 곳에서 관리합니다.

export const SITE_URL = "https://est-fe-3rd-project.vercel.app";

export const SITE_NAME = "Momentalk";

export const SITE_DESCRIPTION =
  "어떤 모임에 어떤 분위기든, 고르기만 하면 AI가 대화 소재를 뽑아 드려요.";

// public/og-image.png (1200 x 630)
export const OG_IMAGE = "/og-image.png";

// Next.js 는 페이지의 openGraph 를 루트와 병합하지 않고 통째로 대체합니다.
// 그래서 페이지마다 images·type·siteName 을 다시 채워 넣어야 합니다.
export const buildOpenGraph = ({ title, description }) => ({
  type: "website",
  siteName: SITE_NAME,
  locale: "ko_KR",
  title,
  description,
  images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} 대표 이미지` }],
});
