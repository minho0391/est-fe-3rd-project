// [인기 게시글 미리보기 영역]
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChatBubbleOutlineOutlined,
  FavoriteIcon,
  LocalFireDepartmentIcon,
} from "@/images/icons";
import { getPopularCommunityPosts } from "@/lib/communityQueries";

export default function PopularPreview({ posts = [] }) {
  const [fetchedPosts, setFetchedPosts] = useState([]);

  useEffect(() => {
    let mounted = true;

    if (posts.length > 0) {
      setFetchedPosts([]);
      return () => {
        mounted = false;
      };
    }

    getPopularCommunityPosts(3)
      .then(rows => {
        if (mounted) setFetchedPosts(rows);
      })
      .catch(error => {
        console.error("인기 게시글을 불러오지 못했습니다.", error);
        if (mounted) setFetchedPosts([]);
      });

    return () => {
      mounted = false;
    };
  }, [posts]);

  const displayPosts = posts.length > 0 ? posts : fetchedPosts;

  return (
    <section className="popular-container">
      <div className="popular-header">
        <div className="popular-titleGroup">
          <LocalFireDepartmentIcon
            className="popular-fireIcon"
            aria-hidden="true"
          />

          <h2 className="popular-title">지금 인기 있는 게시글</h2>
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

            <h3 className="popular-postTitle">{post.title}</h3>

            <div className="popular-cardFooter">
              <div className="popular-statGroup">
                <span className="popular-statItem">
                  <FavoriteIcon aria-hidden="true" fontSize="small" />{" "}
                  {post.likes}
                </span>

                <span className="popular-statItem">
                  <ChatBubbleOutlineOutlined
                    aria-hidden="true"
                    fontSize="small"
                  />{" "}
                  {post.commentsCount}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
