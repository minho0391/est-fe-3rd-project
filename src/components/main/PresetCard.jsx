import styles from "./PresetCard.module.css";

export default function PresetCard({ label, image }) {
  return (
    <article className={styles.card}>
      <div className={styles.imageBox}>
        <img src={image} alt="" className={styles.image} />
      </div>
      <div className={styles.overlay}>
        <span className={styles.label}>{label}</span>
      </div>
    </article>
  );
}
