import "@/community/common.css";
import "@/community/post.css";

import Link from "next/link";
import TopThree from "@/components/post/list/TopThree";
import PostItem from "@/components/post/list/PostItem";
import { getRankablePosts } from "@/data/communityPosts";

export default function CommunityMainPage() {
  const rankablePosts = getRankablePosts();
  const viewPosts = [...rankablePosts].sort((a, b) => b.views - a.views);
  const likedPosts = [...rankablePosts].sort((a, b) => b.likes - a.likes);
  const latestPosts = [...rankablePosts]
    .sort((a, b) => b.id - a.id)
    .slice(0, 3);

  return (
    <main className="community-scope community-page community-main-page">
      <div className="community-main-container">
        <div className="community-main-rankingGrid">
          <TopThree
            title="조회수 TOP 3"
            subtitle="가장 많이 확인한 게시글"
            posts={viewPosts}
            metric="views"
            compact
          />

          <TopThree
            title="좋아요 TOP 3"
            subtitle="가장 많은 공감을 받은 게시글"
            posts={likedPosts}
            metric="likes"
            compact
          />
        </div>

        <section className="community-latest-section">
          <div className="community-section-heading">
            <div>
              <h1 className="community-section-title">전체 최신글</h1>

              <p className="community-section-description">
                최근 등록된 커뮤니티 게시글을 확인해 보세요.
              </p>
            </div>

            <Link className="community-text-link" href="/post/list">
              더보기
            </Link>
          </div>

          <div className="community-post-stack">
            {latestPosts.map(post => (
              <PostItem key={post.id} post={post} compact />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
