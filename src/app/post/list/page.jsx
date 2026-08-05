// [게시글 목록] 페이지 (localhost:3000/post/list)
"use client";

import "@/community/common.css";
import "@/community/post.css";

import { useMemo, useState } from "react";
import Link from "next/link";
import TopThree from "@/components/post/list/TopThree";
import PostFilter from "@/components/post/list/PostFilter";
import PostItem from "@/components/post/list/PostItem";
import { communityPosts } from "@/data/communityPosts";

const posts = communityPosts;

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
            posts={[...posts]
              .filter(post => !post.isNotice)
              .sort((a, b) => b.views - a.views)}
            metric="views"
            compact
          />

          <TopThree
            title="좋아요 TOP 3"
            subtitle="전체 기간"
            posts={[...posts]
              .filter(post => !post.isNotice)
              .sort((a, b) => b.likes - a.likes)}
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
