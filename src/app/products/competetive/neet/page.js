import Link from "next/link";
import styles from "./neet.module.css";

export default function NEETPage() {
  return (
    <div className={styles.container}>

      <div className={`${styles.blob} ${styles.blob1}`}></div>
      <div className={`${styles.blob} ${styles.blob2}`}></div>
      <div className={`${styles.blob} ${styles.blob3}`}></div>

      <section className={styles.hero}>
        <h1>NEET Test Series</h1>
        <p>Focused preparation for medical entrance success.</p>
      </section>

      <section className={styles.cardGrid}>

        <div className={`${styles.card} ${styles.physics}`}>
          <h3>Physics</h3>
          <p>Mechanics • Current Electricity • Optics • Modern Physics</p>
          <Link
            href="/take-test?exam=neet&subject=physics"
            className={styles.button}
          >
            Start Test
          </Link>
        </div>

        <div className={`${styles.card} ${styles.chemistry}`}>
          <h3>Chemistry</h3>
          <p>Physical • Organic • Inorganic • Biomolecules</p>
          <Link
            href="/take-test?exam=neet&subject=chemistry"
            className={styles.button}
          >
            Start Test
          </Link>
        </div>

        <div className={`${styles.card} ${styles.social}`}>
          <h3>Biology</h3>
          <p>Botany • Zoology • Genetics • Human Physiology</p>
          <Link
            href="/take-test?exam=neet&subject=biology"
            className={styles.button}
          >
            Start Test
          </Link>
        </div>

      </section>
    </div>
  );
}
