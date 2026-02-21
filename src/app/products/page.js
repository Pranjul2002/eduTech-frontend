import Link from "next/link";
import styles from "./Products.module.css";

export default function ProductsPage() {
  return (
    <div className={styles.productsContainer}>

      {/* Hero Section */}
      <section className={styles.productsHero}>
        <h1 className={styles.heroTitle}>
          Explore All Test Categories
        </h1>
        <p className={styles.heroSubtitle}>
          Choose what you want to practice — Board Exams, NEET, JEE, and more.
        </p>
      </section>

      {/* Board Exam Section */}
      <section className={styles.categorySection}>
        <h2 className={styles.categoryTitle}>Board Exam Prep</h2>
        <div className={styles.productGrid}>

          <Link href="/products/class_10" className={styles.productCard}>
            <div className={styles.cardIcon}>📘</div>
            <h3>Class 10 Tests</h3>
            <p>MCQs & chapter tests for Class 10 students</p>
          </Link>

          <Link href="/products/class_12" className={styles.productCard}>
            <div className={styles.cardIcon}>📗</div>
            <h3>Class 12 Tests</h3>
            <p>Comprehensive tests for Class 12 subjects</p>
          </Link>

        </div>
      </section>

      {/* Competitive Section */}
      <section className={styles.categorySection}>
        <h2 className={styles.categoryTitle}>Competitive Exams</h2>
        <div className={styles.productGrid}>

          <Link href="/products/competetive/jee" className={styles.productCard}>
            <div className={styles.cardIcon}>⚙️</div>
            <h3>JEE Practice</h3>
            <p>Physics • Chemistry • Mathematics</p>
          </Link>

          <Link href="/products/competetive/neet" className={styles.productCard}>
            <div className={styles.cardIcon}>🧬</div>
            <h3>NEET Practice</h3>
            <p>Physics • Chemistry • Biology</p>
          </Link>

        </div>
      </section>

    </div>
  );
}
