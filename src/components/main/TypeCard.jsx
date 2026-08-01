import styles from "./TypeCard.module.css";

export default function TypeCard({ title, description, icon }) {
  return (
    <article className={styles.card}>
      <img src={icon} alt="" width={48} height={48} className={styles.icon} />
      <div className={styles.text}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </article>
  );
}
