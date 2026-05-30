"use client";

import styles from "./MentorOverview.module.css";

export default function MentorOverview({ user, testCount = 0, isLoading = false }) {
  if (isLoading) {
    return (
      <div className={styles.root}>
        <div className={`${styles.welcome} ${styles.skeleton}`} style={{ height: 120 }} />
        <div className={styles.statsRow}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={`${styles.statCard} ${styles.skeleton}`} style={{ height: 90 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.welcome}>
        <div>
          <h2 className={styles.welcomeTitle}>
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h2>
          <p className={styles.welcomeSub}>
            Manage your tests, track student progress, and build great assessments.
          </p>
        </div>
        <div className={styles.rolePill}>
          <span className={styles.roleIcon}>🎓</span>
          Mentor
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statVal}>{testCount}</span>
          <span className={styles.statLbl}>Tests Created</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statVal} style={{ color: "#3dba74" }}>Active</span>
          <span className={styles.statLbl}>Account Status</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statVal} style={{ color: "#9b7efc" }}>Mentor</span>
          <span className={styles.statLbl}>Role</span>
        </div>
      </div>
    </div>
  );
}