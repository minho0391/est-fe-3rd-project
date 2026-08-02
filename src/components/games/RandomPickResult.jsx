"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import { FORMAT_LABELS } from "@/lib/randomPickData";
import styles from "./RandomPickResult.module.css";

export default function RandomPickResult({ content, onClose, onRepick }) {
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const label = FORMAT_LABELS[content.format_code] ?? "뽑힌 콘텐츠";

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.content}
        role="dialog"
        aria-modal="true"
        aria-label="뽑기 결과"
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.ball}>
          <img src="/randompick-ball.svg" alt="" className={styles.ballImage} />
        </div>

        <div className={styles.card}>
          <span className={styles.chip}>{label}</span>

          <div className={styles.scripts}>
            {content.scripts?.map((script, index) => (
              <p key={index} className={styles.script}>
                {script}
              </p>
            ))}
          </div>

          {content.tips?.length > 0 && (
            <ul className={styles.tips}>
              {content.tips.map((tip, index) => (
                <li key={index} className={styles.tip}>
                  {tip}
                </li>
              ))}
            </ul>
          )}

          <div className={styles.buttons}>
            <Button variant="secondary" onClick={onClose}>
              닫기
            </Button>
            <Button variant="primary" onClick={onRepick}>
              다시 뽑기
            </Button>
          </div>
        </div>

        <p className={styles.notice}>새로운 주제를 원하시면 다시 뽑기 버튼을 눌러주세요.</p>
      </div>
    </div>
  );
}
