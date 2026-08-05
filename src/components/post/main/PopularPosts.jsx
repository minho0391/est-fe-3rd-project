// [인기 게시글 미리보기 영역]
"use client";

import React from "react";
import Link from "next/link";
import { getPopularCommunityPosts } from "@/data/communityPosts";

export default function PopularPreview({ posts = [] }) {
  const displayPosts = posts.length > 0 ? posts : getPopularCommunityPosts(3);

  return (
    <section className="popular-container">
      <div className="popular-header">
        <div className="popular-titleGroup">
          <span className="popular-fireIcon">🔥</span>

          <h3 className="popular-title">지금 인기 있는 게시글</h3>
        </div>

        <button type="button" className="popular-moreBtn">
          전체보기 &gt;
        </button>
      </div>

      <div className="popular-postList">
        {displayPosts.map(post => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="popular-postCard"
          >
            <div className="popular-cardHeader">
              <span className="popular-boardBadge">{post.board}</span>

              <span className="popular-time">{post.createdAt}</span>
            </div>

            <h4 className="popular-postTitle">{post.title}</h4>

            <div className="popular-cardFooter">
              <div className="popular-statGroup">
                <span className="popular-statItem">❤️ {post.likes}</span>

                <span className="popular-statItem">
                  💬 {post.commentsCount}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
