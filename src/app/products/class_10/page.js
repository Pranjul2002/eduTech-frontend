import Link from "next/link";
import styles from "./class10.module.css";

export default function Class10Page() {
  return (
    <div className={styles.container}>

      {/* Floating Background Blobs */}
      <div className={`${styles.blob} ${styles.blob1}`}></div>
      <div className={`${styles.blob} ${styles.blob2}`}></div>
      <div className={`${styles.blob} ${styles.blob3}`}></div>

      {/* Hero Section */}
      <section className={styles.hero}>
        <h1>Class 10 Test Series</h1>
        <p>Select a subject and start practicing smartly.</p>
      </section>

      {/* Subjects Grid */}
      <section className={styles.cardGrid}>

        {/* Physics */}
        <div className={`${styles.card} ${styles.physics}`}>
          <h3>Physics</h3>
          <p>Light • Electricity • Magnetism • Human Eye</p>
          <Link
            href="/take-test?class=10&subject=physics"
            className={styles.button}
          >
            Start Test
          </Link>
        </div>

        {/* Chemistry */}
        <div className={`${styles.card} ${styles.chemistry}`}>
          <h3>Chemistry</h3>
          <p>Chemical Reactions • Acids & Bases • Carbon</p>
          <Link
            href="/take-test?class=10&subject=chemistry"
            className={styles.button}
          >
            Start Test
          </Link>
        </div>

        {/* Mathematics */}
        <div className={`${styles.card} ${styles.maths}`}>
          <h3>Mathematics</h3>
          <p>Trigonometry • Algebra • Geometry • Statistics</p>
          <Link
            href="/take-test?class=10&subject=maths"
            className={styles.button}
          >
            Start Test
          </Link>
        </div>

        {/* Social Science */}
        <div className={`${styles.card} ${styles.social}`}>
          <h3>Social Science</h3>
          <p>History • Geography • Civics • Economics</p>
          <Link
            href="/take-test?class=10&subject=social"
            className={styles.button}
          >
            Start Test
          </Link>
        </div>
        </section>

    </div>
  );
}
