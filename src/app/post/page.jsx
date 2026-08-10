// [커뮤니티 메인] 페이지 (localhost:3000/post)
"use client";

import "@/community/common.css";
import "@/community/post.css";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TopThree from "@/components/post/list/TopThree";
import PostItem from "@/components/post/list/PostItem";
import {
  compareCommunityPostCreatedAtDesc,
  getRankablePosts,
} from "@/lib/communityQueries";

export default function CommunityMainPage() {
  const [rankablePosts, setRankablePosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadPosts = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        const rows = await getRankablePosts();

        if (isMounted) {
          setRankablePosts(rows);
        }
      } catch (error) {
        console.error("커뮤니티 메인 게시글을 불러오지 못했습니다.", error);

        if (isMounted) {
          setLoadError(
            error?.message || "커뮤니티 게시글을 불러오지 못했습니다.",
          );
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

  const { viewPosts, likedPosts, latestPosts } = useMemo(() => {
    const views = [...rankablePosts].sort(
      (a, b) => Number(b.views ?? 0) - Number(a.views ?? 0),
    );
    const likes = [...rankablePosts].sort(
      (a, b) => Number(b.likes ?? 0) - Number(a.likes ?? 0),
    );
    const latest = [...rankablePosts]
      .sort(compareCommunityPostCreatedAtDesc)
      .slice(0, 3);

    return {
      viewPosts: views,
      likedPosts: likes,
      latestPosts: latest,
    };
  }, [rankablePosts]);

  return (
    <main className="community-scope community-page community-main-page">
      <div className="community-main-container">
        {isLoading && (
          <p className="community-listState">게시글을 불러오는 중입니다.</p>
        )}

        {!isLoading && loadError && (
          <div className="community-listState community-listStateError">
            <strong>게시글을 불러오지 못했습니다.</strong>
            <span>{loadError}</span>
          </div>
        )}

        {!isLoading && !loadError && (
          <>
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

              <div
                className="community-listHeader community-listHeaderMain"
                aria-hidden="true"
              >
                <span>분류</span>
                <span>제목</span>
                <span>작성자</span>
                <span>작성일</span>
                <span>조회수</span>
                <span>좋아요</span>
                <span>댓글</span>
              </div>

              <div className="community-post-stack community-tableLikeStack">
                {latestPosts.length > 0 ? (
                  latestPosts.map(post => (
                    <PostItem key={post.id} post={post} compact />
                  ))
                ) : (
                  <p className="community-listState">
                    등록된 게시글이 없습니다.
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
