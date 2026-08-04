import "@/community/common.css";
import "@/community/post.css";

// [게시판 작성] 페이지 (localhost:3000/post/write)
import WriteForm from "@/components/post/write/WriteForm.jsx";

export default function PostWritePage() {
  return (
    <main className="community-scope community-page post-write-page">
      <WriteForm />
    </main>
  );
}
