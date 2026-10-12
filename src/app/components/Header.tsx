import Link from "next/link";
import styles from "./Header.module.scss";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link
          href="/"
          className={styles.logo}
        >
          React AI Study
        </Link>

        <nav className={styles.nav}>
          <Link href="/">
            홈
          </Link>

          <Link href="/study">
            AI 학습
          </Link>

          <Link href="/weather">
            Tailwind 활용 날씨 API
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;