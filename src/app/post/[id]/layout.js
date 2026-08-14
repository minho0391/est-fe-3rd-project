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
    title,
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
