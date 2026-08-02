"use client";

import { useEffect, useRef, useState } from "react";
import GameHeader from "@/components/layout/GameHeader";
import Footer from "@/components/layout/Footer";
import RandomPickResult from "./RandomPickResult";
import { supabase } from "@/lib/supabase";
import { balls, RANDOM_PICK_FORMATS } from "@/lib/randomPickData";
import styles from "./RandomPick.module.css";

const BALL_GAP = 255.5;
const SHUFFLE_STEPS = 4;
const STEP_DURATION = 380;

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export default function RandomPick() {
  const [order, setOrder] = useState(() => balls.map((_, i) => i));
  const [isShuffling, setIsShuffling] = useState(true);
  const [pool, setPool] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [result, setResult] = useState(null);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // 셔플 애니메이션
  useEffect(() => {
    for (let step = 1; step <= SHUFFLE_STEPS; step += 1) {
      timers.current.push(setTimeout(() => setOrder(prev => shuffle(prev)), step * STEP_DURATION));
    }
    timers.current.push(setTimeout(() => setIsShuffling(false), SHUFFLE_STEPS * STEP_DURATION));
    return clearTimers;
  }, []);

  // 콘텐츠 풀 미리 받아두기 (extras는 note가 섞여 있어 select에서 제외)
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data, error } = await supabase
        .from("default_contents")
        .select("id, title, scripts, tips, format_code")
        .in("format_code", RANDOM_PICK_FORMATS)
        .limit(300);

      if (!alive) return;
      if (error || !data || data.length === 0) {
        setLoadError(true);
        return;
      }
      setPool(data);
    })();

    return () => {
      alive = false;
    };
  }, []);

  const pickRandom = previousId => {
    const candidates = pool.filter(item => item.id !== previousId);
    const list = candidates.length > 0 ? candidates : pool;
    return list[Math.floor(Math.random() * list.length)];
  };

  const skipShuffle = () => {
    if (!isShuffling) return;
    clearTimers();
    setOrder(prev => shuffle(prev));
    setIsShuffling(false);
  };

  const handlePick = () => setResult(pickRandom(null));
  const handleRepick = () => setResult(prev => pickRandom(prev?.id));
  const handleClose = () => setResult(null);

  const isReady = !isShuffling && pool.length > 0;

  let titleText = "마음에 드는 공을 하나 고르세요";
  if (isShuffling) titleText = "공을 섞는 중이에요";
  else if (loadError) titleText = "콘텐츠를 불러오지 못했어요";
  else if (pool.length === 0) titleText = "콘텐츠를 불러오는 중이에요";

  return (
    <div className={styles.page}>
      <GameHeader title="랜덤 픽" />

      <main className={styles.main} onClick={skipShuffle}>
        <div className={styles.content}>
          <h2 className={styles.title}>{titleText}</h2>

          <div className={styles.card}>
            <span className={styles.accentBar} aria-hidden="true" />
            <div className={styles.balls}>
              {balls.map((ball, index) => (
                <button
                  key={ball.id}
                  type="button"
                  className={styles.ball}
                  style={{ transform: `translateX(${(order[index] - index) * BALL_GAP}px)` }}
                  onClick={handlePick}
                  disabled={!isReady}
                  aria-label={`${index + 1}번 공 선택`}
                >
                  <span className={styles.highlight} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          {isShuffling && <p className={styles.hint}>화면을 누르면 건너뛸 수 있어요</p>}
          {loadError && <p className={styles.hint}>잠시 후 새로고침해 주세요.</p>}
        </div>
      </main>

      <Footer />

      {result && (
        <RandomPickResult content={result} onClose={handleClose} onRepick={handleRepick} />
      )}
    </div>
  );
}
