import styles from "./Footer.module.css";

const links = ["About", "Privacy Policy", "Terms of Service", "Help Center"];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <span className={styles.logo}>Momentalk</span>
          <p className={styles.copyright}>© 2026 Momentalk AI. All rights reserved.</p>
        </div>

        <nav>
          <ul className={styles.links}>
            {links.map(label => (
              <li key={label}>
                <a href="#" className={styles.link}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
