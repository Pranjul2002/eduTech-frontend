import Link from "next/link";
import styles from "./class12.module.css";

export default function Class12Page() {
  return (
    <div className={styles.container}>

      {/* Floating Background Blobs */}
      <div className={`${styles.blob} ${styles.blob1}`}></div>
      <div className={`${styles.blob} ${styles.blob2}`}></div>
      <div className={`${styles.blob} ${styles.blob3}`}></div>

      {/* Hero Section */}
      <section className={styles.hero}>
        <h1>Class 12 Test Series</h1>
        <p>Select a subject and start advanced preparation.</p>
      </section>

      {/* Subjects Grid */}
      <section className={styles.cardGrid}>

        {/* Physics */}
        <div className={`${styles.card} ${styles.physics}`}>
          <h3>Physics</h3>
          <p>Electrostatics • Current Electricity • Optics • Modern Physics</p>
          <Link
            href="/take-test?class=12&subject=physics"
            className={styles.button}
          >
            Start Test
          </Link>
        </div>

        {/* Chemistry */}
        <div className={`${styles.card} ${styles.chemistry}`}>
          <h3>Chemistry</h3>
          <p>Physical • Organic • Inorganic • Biomolecules</p>
          <Link
            href="/take-test?class=12&subject=chemistry"
            className={styles.button}
          >
            Start Test
          </Link>
        </div>

        {/* Mathematics */}
        <div className={`${styles.card} ${styles.maths}`}>
          <h3>Mathematics</h3>
          <p>Calculus • Matrices • Probability • Vectors & 3D</p>
          <Link
            href="/take-test?class=12&subject=maths"
            className={styles.button}
          >
            Start Test
          </Link>
        </div>

        {/* Biology */}
        <div className={`${styles.card} ${styles.social}`}>
          <h3>Biology</h3>
          <p>Genetics • Evolution • Biotechnology • Ecology</p>
          <Link
            href="/take-test?class=12&subject=biology"
            className={styles.button}
          >
            Start Test
          </Link>
        </div>

      </section>
    </div>
  );
}
