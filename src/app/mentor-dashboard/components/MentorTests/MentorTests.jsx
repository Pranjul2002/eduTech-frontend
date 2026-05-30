"use client";

import { useCallback, useEffect, useState } from "react";
import { getMentorTests } from "@/services/mentorService";
import AddQuestion from "../AddQuestion/AddQuestion";
import styles from "./MentorTests.module.css";

const EmptyIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <rect x="8" y="6" width="32" height="36" rx="4" />
    <path d="M16 16h16M16 22h16M16 28h10" />
    <circle cx="36" cy="36" r="8" fill="#f5f4f0" strokeWidth="1.4" />
    <path d="M33 36h6M36 33v6" stroke="#9ca3af" strokeWidth="1.8" />
  </svg>
);

const ManageIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="2" y="3" width="12" height="10" rx="2" />
    <path d="M5 7h6M5 10h4" />
  </svg>
);

const TestCard = ({ test, onManage, isSelected }) => (
  <div className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}>
    <div className={styles.cardLeft}>
      <div className={styles.titleRow}>
        <span className={styles.testTitle}>{test.title}</span>
        <span className={`${styles.statusDot} ${test.status === "PUBLISHED" ? styles.dotPublished : styles.dotDraft}`}>
          {test.status === "PUBLISHED" ? "Published" : "Draft"}
        </span>
      </div>
      <div className={styles.tagRow}>
        {test.subjectName && <span className={`${styles.tag} ${styles.tagSubject}`}>{test.subjectName}</span>}
        {test.examName    && <span className={`${styles.tag} ${styles.tagExam}`}>{test.examName}</span>}
        {!test.subjectName && !test.examName && <span className={`${styles.tag} ${styles.tagGeneral}`}>General</span>}
        <span className={`${styles.tag} ${styles.tagCount}`}>{test.questionCount} Q</span>
      </div>
    </div>
    <div className={styles.cardRight}>
      <span className={`${styles.priceBadge} ${test.isPaid ? styles.paid : styles.free}`}>
        {test.isPaid ? `₹${test.price}` : "Free"}
      </span>
      <button
        type="button"
        className={`${styles.manageBtn} ${isSelected ? styles.manageBtnActive : ""}`}
        onClick={() => onManage(test)}
        title="Manage questions for this test"
      >
        <ManageIcon />
        Manage
      </button>
      <span className={styles.testId}>#{test.id}</span>
    </div>
  </div>
);

const SkeletonCard = () => <div className={`${styles.card} ${styles.skeleton}`} />;

export default function MentorTests({ refreshTrigger }) {
  const [tests,        setTests]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [selectedTest, setSelectedTest] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMentorTests();
      setTests(data);
    } catch (err) {
      setError(err.message || "Failed to load tests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshTrigger]);

  const handleTestPublished = (updatedTest) => {
    setTests((prev) =>
      prev.map((t) => (t.id === updatedTest.id ? { ...t, status: updatedTest.status } : t))
    );
    setSelectedTest((prev) => (prev ? { ...prev, status: updatedTest.status } : prev));
  };

  const handleManage = (test) => {
    // Toggle off if same test clicked again
    setSelectedTest((prev) => (prev?.id === test.id ? null : test));
  };

  return (
    <div className={`${styles.splitRoot} ${selectedTest ? styles.withPanel : ""}`}>
      {/* ── Left: Test List ─────────────────────────────────────────────── */}
      <div className={styles.listPane}>
        <div className={styles.header}>
          <h2 className={styles.heading}>My Tests</h2>
          {!loading && !error && (
            <span className={styles.count}>{tests.length} test{tests.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {loading && (
          <div className={styles.list}>
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {error && (
          <div className={styles.errorBox}>
            {error}
            <button type="button" className={styles.retryBtn} onClick={load}>Retry</button>
          </div>
        )}

        {!loading && !error && tests.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}><EmptyIcon /></div>
            <p className={styles.emptyText}>No tests yet.</p>
            <p className={styles.emptySub}>Create your first test using the "Create Test" tab.</p>
          </div>
        )}

        {!loading && !error && tests.length > 0 && (
          <div className={styles.list}>
            {tests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                onManage={handleManage}
                isSelected={selectedTest?.id === test.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Right: Manage Panel ─────────────────────────────────────────── */}
      {selectedTest && (
        <div className={styles.managePane}>
          <AddQuestion
            test={selectedTest}
            onClose={() => { setSelectedTest(null); load(); }}
            onTestPublished={handleTestPublished}
          />
        </div>
      )}
    </div>
  );
}