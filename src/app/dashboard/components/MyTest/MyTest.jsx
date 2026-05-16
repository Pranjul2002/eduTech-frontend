"use client";

import { useMemo, useState, useCallback } from "react";
import styles from "./MyTest.module.css";
import { getTestQuestions, submitTest, getMyTests, getTestReview } from "@/services/dashboardService";
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

// ── Inline Analysis view (review mode — no test engine) ───────────────────────
function ReviewAnalysis({ reviewData, testTitle, onClose }) {
  const { attempt, questions } = reviewData;
  const [tab, setTab] = useState("overview");

  const pct      = attempt.totalMarks > 0 ? Math.round((attempt.score / attempt.totalMarks) * 100) : 0;
  const passed   = pct >= 40;
  const accuracy = attempt.attemptedQuestions > 0
    ? Math.round((attempt.correctAnswers / attempt.attemptedQuestions) * 100) : 0;

  const fmtDate = (iso) => iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <div className={styles.reviewRoot}>
      {/* Header */}
      <div className={styles.reviewHeader}>
        <div className={styles.reviewHeaderLeft}>
          <div className={`${styles.reviewVerdict} ${passed ? styles.verdictPass : styles.verdictFail}`}>
            {passed ? "✓ Passed" : "✗ Failed"}
          </div>
          <h2 className={styles.reviewTitle}>{testTitle}</h2>
          <p className={styles.reviewSub}>Attempted on {fmtDate(attempt.submittedAt)}</p>
        </div>
        <div className={styles.reviewScoreBox}>
          <span className={styles.reviewScoreNum}>{attempt.score}</span>
          <span className={styles.reviewScoreSep}>/</span>
          <span className={styles.reviewScoreTotal}>{attempt.totalMarks}</span>
          <span className={styles.reviewScorePct} style={{ color: passed ? "#16a34a" : "#dc2626" }}>
            {pct}%
          </span>
        </div>
        <button className={styles.reviewCloseBtn} onClick={onClose}>✕ Close</button>
      </div>

      {/* Stats row */}
      <div className={styles.reviewStats}>
        {[
          { label: "Total Questions",  value: attempt.totalQuestions },
          { label: "Attempted",        value: attempt.attemptedQuestions },
          { label: "Correct",          value: attempt.correctAnswers,  color: "#16a34a" },
          { label: "Wrong",            value: attempt.wrongAnswers,    color: "#dc2626" },
          { label: "Accuracy",         value: `${accuracy}%`,         color: "#7c3aed" },
        ].map(({ label, value, color }) => (
          <div key={label} className={styles.reviewStatCard}>
            <span className={styles.reviewStatVal} style={color ? { color } : undefined}>{value}</span>
            <span className={styles.reviewStatLbl}>{label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={styles.reviewTabs}>
        {["overview", "questions"].map((key) => (
          <button
            key={key}
            className={`${styles.reviewTab} ${tab === key ? styles.activeReviewTab : ""}`}
            onClick={() => setTab(key)}
          >
            {key === "overview" ? "📊 Overview" : "📝 All Questions"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className={styles.reviewOverview}>
          <div className={styles.reviewBarRow}>
            <span className={styles.reviewBarLabel} style={{ color: "#16a34a" }}>
              Correct · {attempt.correctAnswers}
            </span>
            <div className={styles.reviewBarTrack}>
              <div className={styles.reviewBarFill}
                style={{ width: `${(attempt.correctAnswers / attempt.totalQuestions) * 100}%`, background: "#16a34a" }} />
            </div>
          </div>
          <div className={styles.reviewBarRow}>
            <span className={styles.reviewBarLabel} style={{ color: "#dc2626" }}>
              Wrong · {attempt.wrongAnswers}
            </span>
            <div className={styles.reviewBarTrack}>
              <div className={styles.reviewBarFill}
                style={{ width: `${(attempt.wrongAnswers / attempt.totalQuestions) * 100}%`, background: "#dc2626" }} />
            </div>
          </div>
          <div className={styles.reviewBarRow}>
            <span className={styles.reviewBarLabel} style={{ color: "#9ca3af" }}>
              Skipped · {attempt.totalQuestions - attempt.attemptedQuestions}
            </span>
            <div className={styles.reviewBarTrack}>
              <div className={styles.reviewBarFill}
                style={{ width: `${((attempt.totalQuestions - attempt.attemptedQuestions) / attempt.totalQuestions) * 100}%`, background: "#d1d5db" }} />
            </div>
          </div>
        </div>
      )}

      {tab === "questions" && (
        <div className={styles.reviewQuestions}>
          {questions.map((q, idx) => (
            <div key={q.id} className={styles.reviewQCard}>
              <div className={styles.reviewQNum}>Q{idx + 1} · {q.marks} mark{q.marks !== 1 ? "s" : ""}</div>
              <p className={styles.reviewQText}>{q.questionText}</p>
              <div className={styles.reviewOptions}>
                {["A", "B", "C", "D"].map((letter) => {
                  const text = q[`option${letter}`];
                  const isCorrect = q.correctAnswer?.toUpperCase() === letter;
                  return (
                    <div
                      key={letter}
                      className={styles.reviewOption}
                      style={{
                        background: isCorrect ? "#f0fdf4" : "#f8f9fa",
                        border: isCorrect ? "1.5px solid #16a34a" : "1.5px solid #e5e7eb",
                        color: isCorrect ? "#15803d" : "#374151",
                      }}
                    >
                      <span className={styles.reviewOptLetter}
                        style={{ background: isCorrect ? "#16a34a" : "#e5e7eb", color: isCorrect ? "#fff" : "#6b7280" }}>
                        {letter}
                      </span>
                      <span>{text}</span>
                      {isCorrect && <span className={styles.reviewCorrectTag}>✓ Correct</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Main component
// ════════════════════════════════════════════════════════════════════════════
export default function MyTest({ tests: initialTests = [], isLoading = false }) {
  const [tests,        setTests]        = useState(initialTests);
  const [filter,       setFilter]       = useState("all");

  // Engine state (for starting a fresh attempt)
  const [engineOpen,   setEngineOpen]   = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [questions,    setQuestions]    = useState([]);
  const [loadingQ,     setLoadingQ]     = useState(false);
  const [error,        setError]        = useState("");

  // Review state (for viewing a past attempt)
  const [reviewOpen,   setReviewOpen]   = useState(false);
  const [reviewData,   setReviewData]   = useState(null);   // { attempt, questions }
  const [loadingR,     setLoadingR]     = useState(false);

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

  // ── Review → show Analysis directly without re-entering test engine ─────
  const handleReview = useCallback(async (test) => {
    setError("");
    setLoadingR(true);
    setSelectedTest(test);
    try {
      const data = await getTestReview(test.id);
      setReviewData(data);
      setReviewOpen(true);
    } catch (e) {
      setError(e.message || "Could not load review. Please try again.");
    } finally {
      setLoadingR(false);
    }
  }, []);

  // ── Submit (delegated from engine) ──────────────────────────────────────
  const handleEngineSubmit = useCallback(async (payload) => {
    const res = await submitTest(selectedTest.id, payload);
    getMyTests("FREE").then(setTests).catch(() => {});
    return res;
  }, [selectedTest]);

  // ── Engine closed ────────────────────────────────────────────────────────
  const handleEngineClose = useCallback(() => {
    setEngineOpen(false);
    setSelectedTest(null);
    setQuestions([]);
  }, []);

  // ── Review closed ────────────────────────────────────────────────────────
  const handleReviewClose = useCallback(() => {
    setReviewOpen(false);
    setReviewData(null);
    setSelectedTest(null);
  }, []);

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: Loading skeleton
  // ════════════════════════════════════════════════════════════════════════
  if (isLoading) return <TestsSkeleton />;

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: Loading spinner (starting test or loading review)
  // ════════════════════════════════════════════════════════════════════════
  if (loadingQ || loadingR) {
    return (
      <div className={styles.root}>
        <div className={styles.centreBox}>
          <div className={styles.spinner} />
          <p className={styles.loadingMsg}>
            {loadingR ? "Loading your review…" : "Preparing test environment…"}
          </p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: Review screen (past attempt — no test engine)
  // ════════════════════════════════════════════════════════════════════════
  if (reviewOpen && reviewData) {
    return (
      <ReviewAnalysis
        reviewData={reviewData}
        testTitle={selectedTest?.title || "Test Review"}
        onClose={handleReviewClose}
      />
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: Full-screen test engine (fresh attempt)
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
                  onReview={handleReview}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}