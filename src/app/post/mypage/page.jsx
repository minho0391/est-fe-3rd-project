// [마이페이지] 페이지 (localhost:3000/post/mypage)
"use client";

import React, { useState } from "react";

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("myPosts"); // 'myPosts' | 'myComments' | 'likedPosts'

  // 샘플 사용자 프로필 데이터
  const userProfile = {
    name: "홍길동",
    email: "user@example.com",
    role: "정회원",
    joinDate: "2026.01.15",
    postsCount: 12,
    commentsCount: 28,
    likesCount: 45,
  };

  // 샘플 작성 글 목록
  const myPosts = [
    {
      id: 1,
      board: "자유게시판",
      title: "AI 생성 콘텐츠 활용 후기 공유합니다.",
      createdAt: "2026-07-28",
      views: 120,
      likes: 15,
    },
    {
      id: 2,
      board: "정보공유",
      title: "Next.js 14 App Router 사용 팁 정리",
      createdAt: "2026-07-15",
      views: 340,
      likes: 30,
    },
  ];

  return (
    <main className="mypage-container">
      {/* 1. 상단 프로필 헤더 카드 */}
      <section className="mypage-profileCard">
        <div className="mypage-profileInfo">
          <div className="mypage-avatar">👤</div>

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

        {/* 활동 요약 통계 */}
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

      {/* 2. 활동 내역 탭 영역 */}
      <section className="mypage-contentSection">
        <div className="mypage-tabHeader">
          <button
            type="button"
            className={`${"mypage-tabBtn"} ${activeTab === "myPosts" ? "mypage-active" : ""}`}
            onClick={() => setActiveTab("myPosts")}
          >
            내가 작성한 글 ({myPosts.length})
          </button>

          <button
            type="button"
            className={`${"mypage-tabBtn"} ${activeTab === "myComments" ? "mypage-active" : ""}`}
            onClick={() => setActiveTab("myComments")}
          >
            내가 남긴 댓글
          </button>

          <button
            type="button"
            className={`${"mypage-tabBtn"} ${activeTab === "likedPosts" ? "mypage-active" : ""}`}
            onClick={() => setActiveTab("likedPosts")}
          >
            좋아요한 글
          </button>
        </div>

        {/* 탭 메인 컨텐츠 */}
        <div className="mypage-tabContent">
          {activeTab === "myPosts" && (
            <div className="mypage-postList">
              {myPosts.map(post => (
                <div key={post.id} className="mypage-postItem">
                  <div className="mypage-postHeader">
                    <span className="mypage-boardBadge">{post.board}</span>

                    <span className="mypage-postDate">{post.createdAt}</span>
                  </div>

                  <h3 className="mypage-postTitle">{post.title}</h3>

                  <div className="mypage-postFooter">
                    <span>👁️ 조회 {post.views}</span>

                    <span>❤️ 좋아요 {post.likes}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "myComments" && (
            <p className="mypage-emptyText">
              작성한 댓글 목록이 여기에 표시됩니다.
            </p>
          )}

          {activeTab === "likedPosts" && (
            <p className="mypage-emptyText">
              좋아요 표시한 게시글이 여기에 표시됩니다.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
