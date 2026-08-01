import Link from "next/link";
import styles from "./GameCard.module.css";

export default function GameCard({ title, description, icon, href }) {
  return (
    <Link href={href} className={styles.card}>
      <img src={icon} alt="" width={64} height={64} className={styles.icon} />
      <div className={styles.text}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
      <span className={styles.accentLine} aria-hidden="true" />
    </Link>
  );
}
