// [인기 콘텐츠 영역 (TOP 3)] (금·은·동 메달 표시)
"use client";

import Link from "next/link";
import { EmojiEventsIcon, FavoriteIcon, RemoveRedEyeIcon } from "@/images_icon";

const RANK_BADGES = [
  { rank: 1, className: "top-three-gold" },
  { rank: 2, className: "top-three-silver" },
  { rank: 3, className: "top-three-bronze" },
];

const METRIC_CONFIG = {
  views: { label: "조회수", Icon: RemoveRedEyeIcon },
  likes: { label: "좋아요", Icon: FavoriteIcon },
};

export default function TopThree({
  posts = [],
  title = "실시간 TOP 3 인기글",
  subtitle = "가장 많은 반응을 얻은 게시글이에요",
  metric = "views",
  compact = false,
}) {
  const metricConfig = METRIC_CONFIG[metric] ?? { label: metric, Icon: null };

  const MetricIcon = metricConfig.Icon;

  const topPosts = [...posts]
    .filter(post => post && !post.isNotice)
    .sort((a, b) => (b?.[metric] ?? 0) - (a?.[metric] ?? 0))
    .slice(0, 3);

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
                <EmojiEventsIcon
                  className="top-three-medalIcon"
                  aria-hidden="true"
                />

                <span className="top-three-rankText">{rankInfo.rank}위</span>
              </div>

              <h3 className="top-three-postTitle">{post.title}</h3>

              <div className="top-three-cardFooter">
                <span className="top-three-author">{post.author}</span>

                <div className="top-three-stats">
                  <span className="top-three-statItem">
                    {MetricIcon && (
                      <MetricIcon
                        className="top-three-statIcon"
                        aria-hidden="true"
                      />
                    )}
                    {metricConfig.label} {post?.[metric] ?? 0}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
