import Link from "next/link";
import styles from "./jee.module.css";

export default function JEEPage() {
  return (
    <div className={styles.container}>

      <div className={`${styles.blob} ${styles.blob1}`}></div>
      <div className={`${styles.blob} ${styles.blob2}`}></div>
      <div className={`${styles.blob} ${styles.blob3}`}></div>

      <section className={styles.hero}>
        <h1>JEE Test Series</h1>
        <p>Practice like a topper. Crack JEE with confidence.</p>
      </section>

      <section className={styles.cardGrid}>

        <div className={`${styles.card} ${styles.physics}`}>
          <h3>Physics</h3>
          <p>Mechanics • Thermodynamics • Waves • Modern Physics</p>
          <Link
            href="/take-test?exam=jee&subject=physics"
            className={styles.button}
          >
            Start Test
          </Link>
        </div>

        <div className={`${styles.card} ${styles.chemistry}`}>
          <h3>Chemistry</h3>
          <p>Physical • Organic Reaction • Chemical Bonding</p>
          <Link
            href="/take-test?exam=jee&subject=chemistry"
            className={styles.button}
          >
            Start Test
          </Link>
        </div>

        <div className={`${styles.card} ${styles.maths}`}>
          <h3>Mathematics</h3>
          <p>Algebra • Calculus • Coordinate Geometry • Vectors</p>
          <Link
            href="/take-test?exam=jee&subject=maths"
            className={styles.button}
          >
            Start Test
          </Link>
        </div>

      </section>
    </div>
  );
}
