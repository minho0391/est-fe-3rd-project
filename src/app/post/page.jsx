import "@/community/common.css";
import "@/community/post.css";

import Link from "next/link";
import TopThree from "@/components/post/list/TopThree";
import PostItem from "@/components/post/list/PostItem";

const viewPosts = [
  {
    id: 1,
    title: "랜덤 질문으로 분위기를 빠르게 여는 방법",
    author: "Name",
    likes: 128,
    views: 4000,
  },
  {
    id: 2,
    title: "카드 게임을 활용한 모임 진행 팁",
    author: "Name",
    likes: 96,
    views: 2000,
  },
  {
    id: 3,
    title: "퀴즈로 자연스럽게 대화를 시작해 보세요",
    author: "Name",
    likes: 72,
    views: 1000,
  },
];

const likedPosts = [
  {
    id: 4,
    title: "랜덤 대화 주제 추천 모음",
    author: "Name",
    likes: 2000,
    views: 3100,
  },
  {
    id: 5,
    title: "모두가 공감한 카드 질문 베스트",
    author: "Name",
    likes: 1000,
    views: 1800,
  },
  {
    id: 6,
    title: "처음 만난 사람과 하기 좋은 퀴즈",
    author: "Name",
    likes: 500,
    views: 900,
  },
];

const latestPosts = [
  {
    id: 7,
    board: "랜덤",
    title: "소제목1",
    description: "가볍게 시작하기 좋은 랜덤 대화 주제입니다.",
    author: "닉네임",
    createdAt: "2026.07.26",
    views: 4000,
    likes: 2000,
    commentsCount: 500,
  },
  {
    id: 8,
    board: "카드",
    title: "소제목2",
    description: "모임에서 바로 활용할 수 있는 카드 콘텐츠입니다.",
    author: "닉네임",
    createdAt: "2026.07.26",
    views: 2000,
    likes: 1000,
    commentsCount: 250,
  },
  {
    id: 9,
    board: "퀴즈",
    title: "소제목3",
    description: "분위기를 자연스럽게 이어 주는 퀴즈 콘텐츠입니다.",
    author: "닉네임",
    createdAt: "2026.07.25",
    views: 1000,
    likes: 500,
    commentsCount: 100,
  },
];

export default function CommunityMainPage() {
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
