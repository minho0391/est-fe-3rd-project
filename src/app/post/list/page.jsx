// [게시글 목록] 페이지 (localhost:3000/post/list)
"use client";

import "@/community/common.css";
import "@/community/post.css";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TopThree from "@/components/post/list/TopThree";
import PostFilter from "@/components/post/list/PostFilter";
import PostItem from "@/components/post/list/PostItem";
import {
  compareCommunityPostCreatedAtDesc,
  getCommunityPosts,
} from "@/lib/communityQueries";

export default function PostListPage() {
  const [posts, setPosts] = useState([]);
  const [sort, setSort] = useState("latest");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  useEffect(() => {
    let isMounted = true;

    const loadPosts = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        const rows = await getCommunityPosts();

        if (isMounted) {
          setPosts(rows);
        }
      } catch (error) {
        console.error("게시글 목록을 불러오지 못했습니다.", error);

        if (isMounted) {
          setLoadError("게시글 목록을 불러오지 못했습니다.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const visiblePosts = useMemo(() => {
    const filtered = posts.filter(post =>
      `${post.title} ${post.description}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );

    const noticePosts = filtered
      .filter(post => post.isNotice)
      .sort(compareCommunityPostCreatedAtDesc);

    const normalPosts = filtered
      .filter(post => !post.isNotice)
      .sort((a, b) => {
        if (sort === "likes") return b.likes - a.likes;
        if (sort === "views") return b.views - a.views;
        return compareCommunityPostCreatedAtDesc(a, b);
      });

    return [...noticePosts, ...normalPosts];
  }, [posts, query, sort]);

  const totalPages = Math.max(1, Math.ceil(visiblePosts.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [query, sort]);

  useEffect(() => {
    setCurrentPage(page => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return visiblePosts.slice(startIndex, startIndex + pageSize);
  }, [visiblePosts, currentPage]);

  const pageNumbers = useMemo(() => {
    const maxVisiblePages = 5;
    const start = Math.max(
      1,
      Math.min(
        currentPage - Math.floor(maxVisiblePages / 2),
        totalPages - maxVisiblePages + 1,
      ),
    );
    const count = Math.min(maxVisiblePages, totalPages);

    return Array.from({ length: count }, (_, index) => start + index);
  }, [currentPage, totalPages]);

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

          <div className="community-section-heading">
            <div>
              <h1 className="community-section-title">전체 글보기</h1>

              <p className="community-section-description">
                {visiblePosts.length}개의 글
              </p>
            </div>
          </div>

          {isLoading && (
            <p className="community-listState">게시글을 불러오는 중입니다.</p>
          )}

          {!isLoading && loadError && (
            <p className="community-listState community-listStateError">
              {loadError}
            </p>
          )}

          {!isLoading && !loadError && (
            <>
              <div className="community-listHeader" aria-hidden="true">
                <span>분류</span>
                <span>제목</span>
                <span>작성자</span>
                <span>작성일</span>
                <span>조회수</span>
                <span>좋아요</span>
                <span>댓글</span>
              </div>

              <div className="community-post-stack community-tableLikeStack">
                {paginatedPosts.length > 0 ? (
                  paginatedPosts.map(post => (
                    <PostItem key={post.id} post={post} />
                  ))
                ) : (
                  <p className="community-listState">
                    등록된 게시글이 없습니다.
                  </p>
                )}
              </div>
            </>
          )}

          {!isLoading && !loadError && visiblePosts.length > 0 && (
            <nav
              className="post-list-pagination"
              aria-label="게시글 페이지 이동"
            >
              <button
                type="button"
                className="post-list-pageButton"
                aria-label="이전 페이지"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
              >
                ‹
              </button>

              {pageNumbers.map(page => (
                <button
                  key={page}
                  type="button"
                  className={`post-list-pageButton ${page === currentPage ? "post-list-pageButtonActive" : ""}`}
                  aria-current={page === currentPage ? "page" : undefined}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                className="post-list-pageButton"
                aria-label="다음 페이지"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage(page => Math.min(totalPages, page + 1))
                }
              >
                ›
              </button>
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}
