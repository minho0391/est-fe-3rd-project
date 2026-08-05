import "@/community/common.css";
import "@/community/post.css";

// [게시판 목록] 페이지 (localhost:3000/post)
import PostFilter from "@/components/post/list/PostFilter";
import PostItem from "@/components/post/list/PostItem";
import TopThree from "@/components/post/list/TopThree";

export default function PostListPage() {
  return (
    <main className="community-scope community-page post-list-page">
      {/* 상단 TOP 3 게시글 영역 */}
      <TopThree />

      {/* 게시판 필터 영역 */}
      <PostFilter />

      {/* 게시글 목록 영역 */}
      <PostItem />
    </main>
  );
}
