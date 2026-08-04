// [인기 콘텐츠 영역 (TOP 3)] (금·은·동 메달 표시)
"use client";

import Link from "next/link";

const RANK_BADGES = [
  { rank: 1, medal: "🥇", className: "top-three-gold" },
  { rank: 2, medal: "🥈", className: "top-three-silver" },
  { rank: 3, medal: "🥉", className: "top-three-bronze" },
];

export default function TopThree({
  posts = [],
  title = "실시간 TOP 3 인기글",
  subtitle = "가장 많은 반응을 얻은 게시글이에요",
  metric = "views",
  compact = false,
}) {
  const topPosts = posts.slice(0, 3);

  return (
    <section
      className={`top-three-topThreeContainer ${compact ? "top-three-compact" : ""}`}
    >
      <div className="top-three-header">
        <div>
          <h2 className="top-three-sectionTitle">{title}</h2>

          <p className="top-three-sectionSubtitle">{subtitle}</p>
        </div>
      </div>

      <div className="top-three-cardGrid">
        {topPosts.map((post, index) => {
          const rankInfo = RANK_BADGES[index];

          return (
            <Link
              href={`/post/${post.id}`}
              key={post.id}
              className={`top-three-rankCard ${rankInfo.className}`}
            >
              <div className="top-three-medalBadge">
                <span className="top-three-medalIcon">{rankInfo.medal}</span>

                <span className="top-three-rankText">{rankInfo.rank}위</span>
              </div>

              <h3 className="top-three-postTitle">{post.title}</h3>

              <div className="top-three-cardFooter">
                <span className="top-three-author">{post.author}</span>

                <div className="top-three-stats">
                  <span>조회 {post.views ?? 0}</span>

                  <span>좋아요 {post.likes ?? 0}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
