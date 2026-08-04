// [인기 콘텐츠 영역 (TOP 3)] (금·은·동 메달 표시)
"use client";

import React from "react";

// 메달 및 순위 데이터 구조 정의
const RANK_BADGES = [
  { rank: 1, medal: "🥇", label: "1위 (금메달)", className: "top-three-gold" },
  {
    rank: 2,
    medal: "🥈",
    label: "2위 (은메달)",
    className: "top-three-silver",
  },
  {
    rank: 3,
    medal: "🥉",
    label: "3위 (동메달)",
    className: "top-three-bronze",
  },
];

export default function TopThree({ posts = [] }) {
  // 프롭스로 받은 데이터가 없을 경우 표시할 기본 샘플 데이터
  const samplePosts = [
    {
      id: 1,
      title: "이번 주 가장 높은 반응을 얻은 인기 커뮤니티 글입니다.",
      author: "인기작성자1",
      likes: 342,
      views: 1205,
    },
    {
      id: 2,
      title: "많은 유저들이 공감한 2위 게시글 제목 예시입니다.",
      author: "인기작성자2",
      likes: 289,
      views: 980,
    },
    {
      id: 3,
      title: "3위에 오른 커뮤니티 추천 팁 및 공유 글입니다.",
      author: "인기작성자3",
      likes: 210,
      views: 750,
    },
  ];

  const topPosts = posts.length > 0 ? posts.slice(0, 3) : samplePosts;

  return (
    <section className="top-three-topThreeContainer">
      <div className="top-three-header">
        <h2 className="top-three-sectionTitle">🔥 실시간 TOP 3 인기글</h2>

        <span className="top-three-sectionSubtitle">
          가장 많은 반응을 얻은 게시글이에요
        </span>
      </div>

      <div className="top-three-cardGrid">
        {topPosts.map((post, index) => {
          const rankInfo = RANK_BADGES[index];

          return (
            <div
              key={post.id || index}
              className={`${"top-three-rankCard"} ${rankInfo.className}`}
            >
              {/* 상단 금/은/동 메달 뱃지 */}
              <div className="top-three-medalBadge">
                <span className="top-three-medalIcon">{rankInfo.medal}</span>

                <span className="top-three-rankText">{rankInfo.rank}위</span>
              </div>

              {/* 게시글 제목 및 요약 */}
              <h3 className="top-three-postTitle">{post.title}</h3>

              {/* 하단 정보 (작성자 및 좋아요/조회수) */}
              <div className="top-three-cardFooter">
                <span className="top-three-author">{post.author}</span>

                <div className="top-three-stats">
                  <span>❤️ {post.likes}</span>

                  <span>👁️ {post.views}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
