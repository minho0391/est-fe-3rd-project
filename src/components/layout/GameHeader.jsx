"use client";

import { useRouter } from "next/navigation";
import styles from "./GameHeader.module.css";

export default function GameHeader({ title, onHelp, onSettings }) {
  const router = useRouter();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => router.back()}
            aria-label="뒤로 가기"
          >
            <img src="/header-back.svg" alt="" width={16} height={16} />
          </button>
          <h1 className={styles.title}>{title}</h1>
        </div>

        <div className={styles.right}>
          <button type="button" className={styles.iconButton} onClick={onHelp} aria-label="도움말">
            <img src="/header-help.svg" alt="" width={20} height={20} />
          </button>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onSettings}
            aria-label="설정"
          >
            <img src="/header-settings.svg" alt="" width={20} height={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
