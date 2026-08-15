// [마이페이지 내 AI 저장 콘텐츠 목록]
"use client";

import React from "react";

export default function ContentCabinet({ contents = [] }) {
  return (
    <div className="cabinet-embedded" aria-label="내 AI 저장 콘텐츠">
      <div className="cabinet-contentList">
        {contents.length > 0 ? (
          contents.map(item => (
            <article key={item.id} className="cabinet-contentCard">
              <div className="cabinet-cardTop">
                <span className="cabinet-typeBadge cabinet-aiBadge">
                  {item.badge}
                </span>
              </div>

              <h3 className="cabinet-itemTitle">{item.title}</h3>
              <p className="cabinet-itemPreview">{item.content}</p>

              <div className="cabinet-tagGroup">
                {(item.tags ?? []).map(tag => (
                  <span key={tag} className="cabinet-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            </article>
          ))
        ) : (
          <p className="cabinet-emptyText">저장된 콘텐츠가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
