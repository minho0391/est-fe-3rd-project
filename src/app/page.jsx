import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import PresetCard from "@/components/main/PresetCard";
import TypeCard from "@/components/main/TypeCard";
import GameCard from "@/components/main/GameCard";
import { presets, types, games } from "@/lib/mainPageData";
import styles from "./page.module.css";

export default function MainPage() {
  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              할 말 없어서
              <br />또 폰만 봤죠?
            </h1>
            <p className={styles.heroDescription}>
              어떤 모임에 어떤 분위기든,
              <br />
              고르기만 하면 AI가 대화 소재를 뽑아 드려요.
            </p>
            <Button
              size="cta"
              trailingIcon={<img src="/arrow.svg" alt="" width={16} height={16} />}
            >
              대화 소재 받기
            </Button>
          </div>
        </section>

        <div className={styles.sections}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.heading}>
                <span className={styles.headingTitle}>프리셋 </span>
                <span className={styles.headingSubtitle}>(상황별)</span>
              </h2>
              <button type="button" className={styles.more}>
                더보기
              </button>
            </div>
            <div className={styles.cards}>
              {presets.map(preset => (
                <PresetCard key={preset.id} label={preset.label} image={preset.image} />
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.heading}>
                <span className={styles.headingTitle}>형식 </span>
                <span className={styles.headingSubtitle}>(종류별)</span>
              </h2>
            </div>
            <div className={styles.cards}>
              {types.map(type => (
                <TypeCard
                  key={type.id}
                  title={type.title}
                  description={type.description}
                  icon={type.icon}
                />
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.heading}>
                <span className={styles.headingTitle}>게임</span>
              </h2>
            </div>
            <div className={styles.cards}>
              {games.map(game => (
                <GameCard
                  key={game.id}
                  href={game.href}
                  title={game.title}
                  description={game.description}
                  icon={game.icon}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
