"use client";

import { useMemo, useState, useCallback } from "react";
import styles from "./MyTest.module.css";
import { getTestQuestions, submitTest, getMyTests } from "@/services/dashboardService";
import TestEngine from "@/components/TestEngine/TestEngine";

// ── Status config ─────────────────────────────────────────────────────────────
const statusConfig = {
  passed:  { label: "Passed",  color: "#3dba74", bg: "#3dba7415" },
  failed:  { label: "Failed",  color: "#e8504a", bg: "#e8504a15" },
  pending: { label: "Pending", color: "#e8884a", bg: "#e8884a15" },
};

// ── Small reusable bits ───────────────────────────────────────────────────────
const FilterTab = ({ label, active, onClick }) => (
  <button
    type="button"
    className={`${styles.filterTab} ${active ? styles.activeTab : ""}`}
    onClick={onClick}
  >
    {label}
  </button>
);

const SummaryCard = ({ label, value, color }) => (
  <div className={styles.summCard}>
    <span className={styles.summVal} style={color ? { color } : undefined}>
      {value}
    </span>
    <span className={styles.summLbl}>{label}</span>
  </div>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────
const TestsSkeleton = () => (
  <div className={styles.root}>
    <div className={styles.summRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`${styles.summCard} ${styles.skeletonBlock} ${styles.skeletonSummary}`} />
      ))}
    </div>
    <div className={styles.tableCard}>
      <div className={`${styles.tableHeader} ${styles.skeletonBlock} ${styles.skeletonHeader}`} />
      <div className={styles.testList}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`${styles.testRow} ${styles.skeletonBlock} ${styles.skeletonRow}`} />
        ))}
      </div>
    </div>
  </div>
);

// ── Test row ──────────────────────────────────────────────────────────────────
const TestRow = ({ test, onStart, onReview }) => {
  const config = statusConfig[test.status] || statusConfig.pending;
  const isPending = test.status === "pending";

  return (
    <div className={styles.testRow}>
      <div className={styles.testInfo}>
        <span className={styles.testTitle}>{test.title}</span>
        <span className={styles.testMeta}>
          {test.subject || "General"} {test.date ? `· ${test.date}` : ""}
        </span>
      </div>

      <div className={styles.testScore}>
        {!isPending ? (
          <span className={styles.scoreNum}>
            {test.score}
            <span className={styles.scoreMax}>/{test.total}</span>
          </span>
        ) : (
          <span className={styles.pendingLabel}>—</span>
        )}
      </div>

      <div className={styles.testDuration}>
        <span>{test.duration ? `${test.duration} min` : "—"}</span>
      </div>

      <div>
        <span
          className={styles.statusBadge}
          style={{ color: config.color, background: config.bg }}
        >
          {config.label}
        </span>
      </div>

      <button
        type="button"
        className={styles.viewBtn}
        onClick={() => (isPending ? onStart(test) : onReview(test))}
      >
        {isPending ? "Start" : "Review"}
      </button>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// Main component
// ════════════════════════════════════════════════════════════════════════════
export default function MyTest({ tests: initialTests = [], isLoading = false }) {
  const [tests,        setTests]        = useState(initialTests);
  const [filter,       setFilter]       = useState("all");

  // Engine state
  const [engineOpen,   setEngineOpen]   = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [questions,    setQuestions]    = useState([]);
  const [loadingQ,     setLoadingQ]     = useState(false);
  const [error,        setError]        = useState("");

  // Keep in sync when parent refreshes
  useMemo(() => { setTests(initialTests); }, [initialTests]);

  // ── Filtered list ───────────────────────────────────────────────────────
  const filtered = useMemo(
    () => filter === "all" ? tests : tests.filter((t) => t.status === filter),
    [filter, tests]
  );

  // ── Stats ───────────────────────────────────────────────────────────────
  const completedTests = tests.filter((t) => t.status !== "pending");
  const passedCount    = tests.filter((t) => t.status === "passed").length;
  const failedCount    = tests.filter((t) => t.status === "failed").length;
  const passRate       = completedTests.length
    ? Math.round((passedCount / completedTests.length) * 100) : 0;
  const avgScore       = completedTests.length
    ? Math.round(completedTests.reduce((s, t) => s + (Number(t.score) || 0), 0) / completedTests.length)
    : 0;

  // ── Start test → open engine ────────────────────────────────────────────
  const handleStart = useCallback(async (test) => {
    setError("");
    setLoadingQ(true);
    setSelectedTest(test);
    setQuestions([]);
    try {
      const qs = await getTestQuestions(test.id);
      setQuestions(qs);
      setEngineOpen(true);
    } catch (e) {
      setError(e.message || "Could not load questions. Please try again.");
    } finally {
      setLoadingQ(false);
    }
  }, []);

  // ── Submit (delegated from engine) ──────────────────────────────────────
  const handleEngineSubmit = useCallback(async (payload) => {
    const res = await submitTest(selectedTest.id, payload);
    // Refresh list in background
    getMyTests("FREE").then(setTests).catch(() => {});
    return res;
  }, [selectedTest]);

  // ── Engine closed (after analysis viewed) ───────────────────────────────
  const handleEngineClose = useCallback(() => {
    setEngineOpen(false);
    setSelectedTest(null);
    setQuestions([]);
  }, []);

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: Loading skeleton
  // ════════════════════════════════════════════════════════════════════════
  if (isLoading) return <TestsSkeleton />;

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: Question-loading spinner
  // ════════════════════════════════════════════════════════════════════════
  if (loadingQ) {
    return (
      <div className={styles.root}>
        <div className={styles.centreBox}>
          <div className={styles.spinner} />
          <p className={styles.loadingMsg}>Preparing test environment…</p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: Full-screen test engine (portal-like, covers entire viewport)
  // ════════════════════════════════════════════════════════════════════════
  if (engineOpen && selectedTest && questions.length > 0) {
    return (
      <TestEngine
        test={selectedTest}
        questions={questions}
        onSubmit={handleEngineSubmit}
        onClose={handleEngineClose}
      />
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: Main list view
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className={styles.root}>
      {error && <p className={styles.errorMsg}>{error}</p>}

      {/* Summary cards */}
      <div className={styles.summRow}>
        <SummaryCard label="Total Tests"  value={tests.length} />
        <SummaryCard label="Passed"       value={passedCount}  color="#3dba74" />
        <SummaryCard label="Failed"       value={failedCount}  color="#e8504a" />
        <SummaryCard label="Pass Rate"    value={`${passRate}%`} color="#9b7efc" />
        <SummaryCard label="Avg Score"    value={avgScore}     color="#e8884a" />
      </div>

      {/* Table card */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <span className={styles.cardTitle}>My Tests</span>
          <div className={styles.filterRow}>
            {["all", "passed", "failed", "pending"].map((val) => (
              <FilterTab
                key={val}
                label={val.charAt(0).toUpperCase() + val.slice(1)}
                active={filter === val}
                onClick={() => setFilter(val)}
              />
            ))}
          </div>
        </div>

        {tests.length === 0 ? (
          <div className={styles.inlineEmpty}>No tests available yet.</div>
        ) : filtered.length === 0 ? (
          <div className={styles.inlineEmpty}>No tests found for this filter.</div>
        ) : (
          <>
            <div className={styles.tableHead}>
              <span>Test</span>
              <span>Score</span>
              <span>Duration</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            <div className={styles.testList}>
              {filtered.map((test) => (
                <TestRow
                  key={test.id}
                  test={test}
                  onStart={handleStart}
                  onReview={handleStart}  // for past tests, re-enter engine in review mode if needed
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}