import styles from "./Header.module.css";

const navItems = [
  { label: "Discover", href: "#", active: false },
  { label: "Topics", href: "#", active: false },
  { label: "Games", href: "#", active: false },
  { label: "Community", href: "#", active: true },
];

export default function Header() {
  const getNavClass = active => (active ? `${styles.navLink} ${styles.active}` : styles.navLink);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <a href="/" className={styles.logo}>
            Momentalk
          </a>
          <nav>
            <ul className={styles.nav}>
              {navItems.map(item => (
                <li key={item.label}>
                  <a href={item.href} className={getNavClass(item.active)}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className={styles.auth}>
          <button type="button" className={styles.login}>
            로그인
          </button>
          <button type="button" className={styles.signup}>
            회원가입
          </button>
        </div>
      </div>
    </header>
  );
}
