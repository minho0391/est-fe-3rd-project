// [사용자 프로필 영역]
"use client";

import React from "react";

export default function UserProfile({ user }) {
  // 전달받은 프로필 데이터가 없을 때 사용할 기본값 설정
  const {
    name = "홍길동",
    role = "정회원",
    avatarUrl = "https://via.placeholder.com/80",
    postsCount = 12,
    commentsCount = 48,
    likeCount = 156,
    level = 5,
  } = user || {};

  return (
    <div className="user-profile-profileCard">
      {/* 아바타 및 사용자 기본 정보 */}
      <div className="user-profile-userInfoGroup">
        <div className="user-profile-avatarWrapper">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${name} 프로필`}
              className="user-profile-avatar"
            />
          ) : (
            <div className="user-profile-avatarPlaceholder">👤</div>
          )}

          <span className="user-profile-levelBadge">Lv.{level}</span>
        </div>

        <div className="user-profile-userDetails">
          <div className="user-profile-nameRow">
            <h2 className="user-profile-userName">{name}</h2>

            <span className="user-profile-roleBadge">{role}</span>
          </div>

          <p className="user-profile-userSubtext">
            오늘도 즐거운 커뮤니티 활동 되세요!
          </p>
        </div>
      </div>

      {/* 활동 통계 (작성글, 댓글, 받은 좋아요) */}
      <div className="user-profile-statsContainer">
        <div className="user-profile-statBox">
          <span className="user-profile-statLabel">작성글</span>

          <span className="user-profile-statValue">{postsCount}개</span>
        </div>

        <div className="user-profile-divider" />

        <div className="user-profile-statBox">
          <span className="user-profile-statLabel">작성 댓글</span>

          <span className="user-profile-statValue">{commentsCount}개</span>
        </div>

        <div className="user-profile-divider" />

        <div className="user-profile-statBox">
          <span className="user-profile-statLabel">받은 좋아요</span>

          <span className="user-profile-statValue">❤️ {likeCount}</span>
        </div>
      </div>
    </div>
  );
}
