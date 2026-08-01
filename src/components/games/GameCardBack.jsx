import styles from "./GameCardBack.module.css";

export default function GameCardBack({ onClick }) {
  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <span className={styles.logo}>M</span>
    </button>
  );
}
