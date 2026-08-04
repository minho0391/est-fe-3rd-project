"use client";

import "@/community/common.css";
import "@/community/post.css";

import { useMemo, useState } from "react";
import Link from "next/link";
import TopThree from "@/components/post/list/TopThree";
import PostFilter from "@/components/post/list/PostFilter";
import PostItem from "@/components/post/list/PostItem";

const posts = [
  {
    id: 1,
    isNotice: true,
    board: "공지",
    title: "플랫폼 규칙 안내: 필독",
    description: "건강한 커뮤니티 이용을 위한 기본 규칙입니다.",
    author: "관리자",
    createdAt: "2026.07.28",
    views: 1200,
    likes: 6000,
    commentsCount: 3000,
  },
  {
    id: 2,
    isNotice: true,
    board: "공지",
    title: "시스템 코어 업데이트 V2.0 사전 안내",
    description: "업데이트 일정과 주요 변경 내용을 안내합니다.",
    author: "관리자",
    createdAt: "2026.07.27",
    views: 7000,
    likes: 3000,
    commentsCount: 1000,
  },
  {
    id: 3,
    board: "랜덤",
    title: "소제목1",
    description: "랜덤 대화 주제와 활용 방법을 공유합니다.",
    author: "닉네임",
    createdAt: "2026.07.26",
    views: 4000,
    likes: 2000,
    commentsCount: 500,
  },
  {
    id: 4,
    board: "카드",
    title: "소제목2",
    description: "카드 콘텐츠를 활용한 모임 진행 팁입니다.",
    author: "닉네임",
    createdAt: "2026.07.26",
    views: 2000,
    likes: 1000,
    commentsCount: 250,
  },
  {
    id: 5,
    board: "퀴즈",
    title: "소제목3",
    description: "함께 즐기기 좋은 퀴즈 콘텐츠입니다.",
    author: "닉네임",
    createdAt: "2026.07.25",
    views: 1000,
    likes: 500,
    commentsCount: 100,
  },
];

export default function PostListPage() {
  const [sort, setSort] = useState("latest");

  const [query, setQuery] = useState("");

  const visiblePosts = useMemo(() => {
    const filtered = posts.filter(post =>
      `${post.title} ${post.description}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );

    return [...filtered].sort((a, b) => {
      if (sort === "likes") return b.likes - a.likes;
      if (sort === "views") return b.views - a.views;
      return b.id - a.id;
    });
  }, [query, sort]);

  return (
    <main className="community-scope community-page post-list-page">
      <div className="post-list-container">
        <div className="post-list-rankingGrid">
          <TopThree
            title="조회수 TOP 3"
            subtitle="전체 기간"
            posts={posts}
            metric="views"
            compact
          />

          <TopThree
            title="좋아요 TOP 3"
            subtitle="전체 기간"
            posts={[...posts].sort((a, b) => b.likes - a.likes)}
            metric="likes"
            compact
          />
        </div>

        <section className="post-list-boardSection">
          <div className="post-list-toolbar">
            <PostFilter onSortChange={setSort} />

            <div className="post-list-searchGroup">
              <label className="post-list-searchLabel" htmlFor="post-search">
                검색
              </label>

              <input
                id="post-search"
                className="post-list-searchInput"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="검색어를 입력해 주세요."
              />

              <Link href="/post/write" className="post-list-writeLink">
                글쓰기
              </Link>
            </div>
          </div>

          <div className="community-section-heading post-list-heading">
            <div>
              <h1 className="community-section-title">전체 글보기</h1>

              <p className="community-section-description">
                {visiblePosts.length}개의 글
              </p>
            </div>
          </div>

          <div className="community-post-stack">
            {visiblePosts.map(post => (
              <PostItem key={post.id} post={post} />
            ))}
          </div>

          <nav className="post-list-pagination" aria-label="게시글 페이지 이동">
            <button
              type="button"
              className="post-list-pageButton"
              aria-label="이전 페이지"
            >
              ‹
            </button>

            {[1, 2, 3, 4, 5].map(page => (
              <button
                key={page}
                type="button"
                className={`post-list-pageButton ${page === 1 ? "post-list-pageButtonActive" : ""}`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className="post-list-pageButton"
              aria-label="다음 페이지"
            >
              ›
            </button>
          </nav>
        </section>
      </div>
    </main>
  );
}
