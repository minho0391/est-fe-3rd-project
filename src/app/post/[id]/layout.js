import { SITE_NAME, buildOpenGraph } from "@/lib/site";
import { createClient } from "@/utils/supabase/server";

const FALLBACK_TITLE = "게시글";
const FALLBACK_DESCRIPTION = "Momentalk 커뮤니티에 올라온 게시글입니다.";

// 본문에서 줄바꿈과 연속 공백을 걷어내고 설명용으로 잘라 씁니다.
const toSummary = (text, max = 120) => {
  const value = String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!value) return "";
  return value.length > max ? `${value.slice(0, max)}…` : value;
};

export async function generateMetadata({ params }) {
  const { id } = await params;

  let post;

  // 조회에 실패해도 화면은 떠야 하므로 기본 문구로 넘어갑니다.
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("title, description, content_text")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();

    post = data ?? undefined;
  } catch {
    post = undefined;
  }

  const title = post?.title?.trim() || FALLBACK_TITLE;
  const description =
    toSummary(post?.description) || toSummary(post?.content_text) || FALLBACK_DESCRIPTION;

  return {
    // default: 상세 페이지 자신의 title (상위 template 이 사이트명을 붙여줍니다)
    // template: 하위 페이지(/post/[id]/edit)에도 사이트명이 붙도록 다시 선언합니다.
    //           중간 layout 이 title 을 문자열로 두면 상위 template 이 하위로 전파되지 않습니다.
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    openGraph: buildOpenGraph({
      title: `${title} | ${SITE_NAME}`,
      description,
    }),
  };
}

export default function PostDetailLayout({ children }) {
  return children;
}
