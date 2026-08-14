import { SITE_NAME, buildOpenGraph } from "@/lib/site";

const TITLE = "회원가입";
const DESCRIPTION =
  "Momentalk 회원이 되면 AI가 만든 대화 가이드를 보관하고, 커뮤니티에 글과 댓글을 남길 수 있습니다.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: buildOpenGraph({
    title: `${TITLE} | ${SITE_NAME}`,
    description: "가입하면 대화 가이드를 보관하고 커뮤니티를 이용할 수 있어요.",
  }),
};

export default function SignUpLayout({ children }) {
  return children;
}
