// [마이페이지] 페이지 (localhost:3000/post/mypage)
"use client";

import "@/community/common.css";
import "@/community/mypage.css";

import React, { useState } from "react";
import Link from "next/link";
import {
  AccountCircleIcon,
  FavoriteIcon,
  RemoveRedEyeIcon,
} from "@/images_icon";
import {
  getCommentsByAuthorId,
  getCurrentUserProfile,
  getLikedPostsByCurrentUser,
  getPostsByAuthorId,
} from "@/data/communityPosts";

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("myPosts");
  const userProfile = getCurrentUserProfile();
  const myPosts = getPostsByAuthorId(userProfile.id);
  const myComments = getCommentsByAuthorId(userProfile.id);
  const likedPosts = getLikedPostsByCurrentUser();

  const renderPostList = posts => (
    <div className="mypage-postList">
      {posts.map(post => (
        <Link
          key={post.id}
          href={`/post/${post.id}`}
          className="mypage-postItem"
        >
          <div className="mypage-postHeader">
            <span className="mypage-boardBadge">{post.board}</span>

            <span className="mypage-postDate">{post.createdAt}</span>
          </div>

          <h3 className="mypage-postTitle">{post.title}</h3>

          <div className="mypage-postFooter">
            <span>
              <RemoveRedEyeIcon aria-hidden="true" fontSize="small" /> 조회{" "}
              {post.views}
            </span>

            <span>
              <FavoriteIcon aria-hidden="true" fontSize="small" /> 좋아요{" "}
              {post.likes}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <main className="community-scope community-page mypage-container">
      <section className="mypage-profileCard">
        <div className="mypage-profileInfo">
          <div className="mypage-avatar">
            <AccountCircleIcon aria-hidden="true" />
          </div>

          <div className="mypage-userDetails">
            <div className="mypage-nameGroup">
              <h1 className="mypage-userName">{userProfile.name}</h1>

              <span className="mypage-roleBadge">{userProfile.role}</span>
            </div>

            <p className="mypage-userEmail">{userProfile.email}</p>

            <span className="mypage-joinDate">
              가입일: {userProfile.joinDate}
            </span>
          </div>
        </div>

        <div className="mypage-statsGroup">
          <div className="mypage-statItem">
            <span className="mypage-statNumber">{userProfile.postsCount}</span>

            <span className="mypage-statLabel">작성글</span>
          </div>

          <div className="mypage-statDivider" />

          <div className="mypage-statItem">
            <span className="mypage-statNumber">
              {userProfile.commentsCount}
            </span>

            <span className="mypage-statLabel">작성 댓글</span>
          </div>

          <div className="mypage-statDivider" />

          <div className="mypage-statItem">
            <span className="mypage-statNumber">{userProfile.likesCount}</span>

            <span className="mypage-statLabel">받은 좋아요</span>
          </div>
        </div>
      </section>

      <section className="mypage-contentSection">
        <div className="mypage-tabHeader">
          <button
            type="button"
            className={`mypage-tabBtn ${activeTab === "myPosts" ? "mypage-active" : ""}`}
            onClick={() => setActiveTab("myPosts")}
          >
            내가 작성한 글 ({myPosts.length})
          </button>

          <button
            type="button"
            className={`mypage-tabBtn ${activeTab === "myComments" ? "mypage-active" : ""}`}
            onClick={() => setActiveTab("myComments")}
          >
            내가 남긴 댓글 ({myComments.length})
          </button>

          <button
            type="button"
            className={`mypage-tabBtn ${activeTab === "likedPosts" ? "mypage-active" : ""}`}
            onClick={() => setActiveTab("likedPosts")}
          >
            좋아요한 글 ({likedPosts.length})
          </button>
        </div>

        <div className="mypage-tabContent">
          {activeTab === "myPosts" && renderPostList(myPosts)}

          {activeTab === "myComments" && (
            <div className="mypage-postList">
              {myComments.map(comment => (
                <Link
                  key={comment.id}
                  href={`/post/${comment.postId}`}
                  className="mypage-postItem"
                >
                  <div className="mypage-postHeader">
                    <span className="mypage-boardBadge">댓글</span>

                    <span className="mypage-postDate">{comment.createdAt}</span>
                  </div>

                  <p className="mypage-postTitle">{comment.content}</p>
                </Link>
              ))}
            </div>
          )}
          {activeTab === "likedPosts" && renderPostList(likedPosts)}
        </div>
      </section>
    </main>
  );
}
