"use client";

import { useMemo, useState, useCallback } from "react";
import styles from "./MyTest.module.css";
import { getTestQuestions, submitTest, getMyTests, getTestReview } from "@/services/dashboardService";
import TestEngine from "@/components/TestEngine/TestEngine";

// ── Status config ─────────────────────────────────────────────────────────────
const statusConfig = {
  passed:  { label: "Passed",  color: "#16a34a", bg: "#dcfce7" },
  failed:  { label: "Failed",  color: "#dc2626", bg: "#fee2e2" },
  pending: { label: "Pending", color: "#d97706", bg: "#fef3c7" },
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, iconBg }) => (
  <div className={styles.statCard}>
    <div className={styles.statIconWrap} style={{ background: iconBg }}>{icon}</div>
    <div className={styles.statText}>
      <span className={styles.statVal}>{value}</span>
      <span className={styles.statLbl}>{label}</span>
    </div>
  </div>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────
const TestsSkeleton = () => (
  <div className={styles.root}>
    <div className={styles.statsRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`${styles.statCard} ${styles.skeletonCard}`}>
          <div className={`${styles.statIconWrap} ${styles.skeletonBlock}`} style={{ background: "transparent" }} />
          <div className={styles.statText}>
            <div className={`${styles.skeletonLine} ${styles.skeletonShort}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonMed}`} />
          </div>
        </div>
      ))}
    </div>
    <div className={styles.tableCard}>
      <div className={`${styles.skeletonBlock} ${styles.skeletonHeader}`} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`${styles.skeletonBlock} ${styles.skeletonRow}`} />
      ))}
    </div>
  </div>
);

// ── Test row ──────────────────────────────────────────────────────────────────
const TestRow = ({ test, onStart, onReview }) => {
  const config    = statusConfig[test.status] || statusConfig.pending;
  const isPending = test.status === "pending";
  const iconBg    = isPending ? "#f0fdf4" : "#eff6ff";
  const iconColor = isPending ? "#22c55e" : "#3b82f6";

  return (
    <div className={styles.testRow}>
      {/* Test name + meta */}
      <div className={styles.testInfo}>
        <div className={styles.testIconWrap} style={{ background: iconBg }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div>
          <span className={styles.testTitle}>{test.title}</span>
          <span className={styles.testMeta}>
            {test.subject || "General"}{test.date ? ` • ${test.date}` : ""}
          </span>
        </div>
      </div>

      {/* Score */}
      <div className={styles.testScore}>
        {!isPending ? (
          <span className={styles.scoreNum}>
            <strong>{test.score}</strong>
            <span className={styles.scoreMax}>/{test.total}</span>
          </span>
        ) : (
          <span className={styles.dash}>—</span>
        )}
      </div>

      {/* Duration */}
      <div className={styles.testDuration}>
        <span className={styles.dash}>{test.duration ? `${test.duration} min` : "—"}</span>
      </div>

      {/* Status badge */}
      <div>
        <span className={styles.statusBadge} style={{ color: config.color, background: config.bg }}>
          {config.label}
        </span>
      </div>

      {/* Action buttons */}
      <div className={styles.actionCell}>
        {!isPending && (
          <button type="button" className={styles.reviewBtn} onClick={() => onReview(test)}>
            Review
          </button>
        )}
        <button
          type="button"
          className={isPending ? styles.startBtn : styles.retakeBtn}
          onClick={() => onStart(test)}
        >
          {isPending ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Start Test
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
              Retake Test
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Review Analysis ───────────────────────────────────────────────────────────
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
          <span className={styles.reviewScorePct} style={{ color: passed ? "#16a34a" : "#dc2626" }}>{pct}%</span>
        </div>
        <button className={styles.reviewCloseBtn} onClick={onClose}>✕ Close</button>
      </div>

      <div className={styles.reviewStats}>
        {[
          { label: "Total Questions", value: attempt.totalQuestions },
          { label: "Attempted",       value: attempt.attemptedQuestions },
          { label: "Correct",         value: attempt.correctAnswers,  color: "#16a34a" },
          { label: "Wrong",           value: attempt.wrongAnswers,    color: "#dc2626" },
          { label: "Accuracy",        value: `${accuracy}%`,         color: "#7c3aed" },
        ].map(({ label, value, color }) => (
          <div key={label} className={styles.reviewStatCard}>
            <span className={styles.reviewStatVal} style={color ? { color } : undefined}>{value}</span>
            <span className={styles.reviewStatLbl}>{label}</span>
          </div>
        ))}
      </div>

      <div className={styles.reviewTabs}>
        {["overview", "questions"].map((key) => (
          <button key={key} className={`${styles.reviewTab} ${tab === key ? styles.activeReviewTab : ""}`} onClick={() => setTab(key)}>
            {key === "overview" ? "📊 Overview" : "📝 All Questions"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className={styles.reviewOverview}>
          {[
            { label: `Correct · ${attempt.correctAnswers}`,   fill: (attempt.correctAnswers / attempt.totalQuestions) * 100, color: "#16a34a" },
            { label: `Wrong · ${attempt.wrongAnswers}`,        fill: (attempt.wrongAnswers / attempt.totalQuestions) * 100,   color: "#dc2626" },
            { label: `Skipped · ${attempt.totalQuestions - attempt.attemptedQuestions}`, fill: ((attempt.totalQuestions - attempt.attemptedQuestions) / attempt.totalQuestions) * 100, color: "#9ca3af" },
          ].map(({ label, fill, color }) => (
            <div key={label} className={styles.reviewBarRow}>
              <span className={styles.reviewBarLabel} style={{ color }}>{label}</span>
              <div className={styles.reviewBarTrack}><div className={styles.reviewBarFill} style={{ width: `${fill}%`, background: color }} /></div>
            </div>
          ))}
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
                  const isCorrect = q.correctAnswer?.toUpperCase() === letter;
                  return (
                    <div key={letter} className={styles.reviewOption} style={{ background: isCorrect ? "#f0fdf4" : "#f8f9fa", border: isCorrect ? "1.5px solid #16a34a" : "1.5px solid #e5e7eb", color: isCorrect ? "#15803d" : "#374151" }}>
                      <span className={styles.reviewOptLetter} style={{ background: isCorrect ? "#16a34a" : "#e5e7eb", color: isCorrect ? "#fff" : "#6b7280" }}>{letter}</span>
                      <span>{q[`option${letter}`]}</span>
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
  const [search,       setSearch]       = useState("");

  const [engineOpen,   setEngineOpen]   = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [questions,    setQuestions]    = useState([]);
  const [loadingQ,     setLoadingQ]     = useState(false);
  const [error,        setError]        = useState("");

  const [reviewOpen,   setReviewOpen]   = useState(false);
  const [reviewData,   setReviewData]   = useState(null);
  const [loadingR,     setLoadingR]     = useState(false);

  useMemo(() => { setTests(initialTests); }, [initialTests]);

  const filtered = useMemo(() => {
    let list = filter === "all" ? tests : tests.filter((t) => t.status === filter);
    if (search.trim()) list = list.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [filter, search, tests]);

  const completedTests = tests.filter((t) => t.status !== "pending");
  const passedCount    = tests.filter((t) => t.status === "passed").length;
  const failedCount    = tests.filter((t) => t.status === "failed").length;
  const passRate       = completedTests.length ? Math.round((passedCount / completedTests.length) * 100) : 0;
  const avgScore       = completedTests.length
    ? Math.round(completedTests.reduce((s, t) => s + (Number(t.score) || 0), 0) / completedTests.length) : 0;

  const handleStart = useCallback(async (test) => {
    setError(""); setLoadingQ(true); setSelectedTest(test); setQuestions([]);
    try { const qs = await getTestQuestions(test.id); setQuestions(qs); setEngineOpen(true); }
    catch (e) { setError(e.message || "Could not load questions. Please try again."); }
    finally { setLoadingQ(false); }
  }, []);

  const handleReview = useCallback(async (test) => {
    setError(""); setLoadingR(true); setSelectedTest(test);
    try { const data = await getTestReview(test.id); setReviewData(data); setReviewOpen(true); }
    catch (e) { setError(e.message || "Could not load review. Please try again."); }
    finally { setLoadingR(false); }
  }, []);

  const handleEngineSubmit = useCallback(async (payload) => {
    const res = await submitTest(selectedTest.id, payload);
    getMyTests("FREE").then(setTests).catch(() => {});
    return res;
  }, [selectedTest]);

  const handleEngineClose = useCallback(() => { setEngineOpen(false); setSelectedTest(null); setQuestions([]); }, []);
  const handleReviewClose = useCallback(() => { setReviewOpen(false); setReviewData(null); setSelectedTest(null); }, []);

  if (isLoading) return <TestsSkeleton />;

  if (loadingQ || loadingR) return (
    <div className={styles.root}>
      <div className={styles.centreBox}>
        <div className={styles.spinner} />
        <p className={styles.loadingMsg}>{loadingR ? "Loading your review…" : "Preparing test environment…"}</p>
      </div>
    </div>
  );

  if (reviewOpen && reviewData) return (
    <ReviewAnalysis reviewData={reviewData} testTitle={selectedTest?.title || "Test Review"} onClose={handleReviewClose} />
  );

  if (engineOpen && selectedTest && questions.length > 0) return (
    <TestEngine test={selectedTest} questions={questions} onSubmit={handleEngineSubmit} onClose={handleEngineClose} />
  );

  return (
    <div className={styles.root}>
      {error && <p className={styles.errorMsg}>{error}</p>}

      {/* ── Stat cards ── */}
      <div className={styles.statsRow}>
        <StatCard label="Total Tests" value={tests.length} iconBg="#eff6ff"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
        />
        <StatCard label="Passed" value={passedCount} iconBg="#f0fdf4"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>}
        />
        <StatCard label="Failed" value={failedCount} iconBg="#fef2f2"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
        />
        <StatCard label="Pass Rate" value={`${passRate}%`} iconBg="#faf5ff"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.8" strokeLinecap="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>}
        />
        <StatCard label="Avg Score" value={avgScore} iconBg="#fffbeb"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
        />
      </div>

      {/* ── Table card ── */}
      <div className={styles.tableCard}>
        {/* Header */}
        <div className={styles.tableHeader}>
          <span className={styles.cardTitle}>My Tests</span>

          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search test..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.filterRow}>
            {["all", "passed", "failed", "pending"].map((val) => (
              <button
                key={val}
                type="button"
                className={`${styles.filterTab} ${filter === val ? styles.activeTab : ""}`}
                onClick={() => setFilter(val)}
              >
                {val === "all" ? "All" : val.charAt(0).toUpperCase() + val.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Column headings */}
        <div className={styles.tableHead}>
          <span>TEST</span>
          <span>SCORE</span>
          <span>DURATION</span>
          <span>STATUS</span>
          <span>ACTION</span>
        </div>

        {/* Rows */}
        {tests.length === 0 ? (
          <div className={styles.inlineEmpty}>No tests available yet.</div>
        ) : filtered.length === 0 ? (
          <div className={styles.inlineEmpty}>No tests match your search / filter.</div>
        ) : (
          <div className={styles.testList}>
            {filtered.map((test) => (
              <TestRow key={test.id} test={test} onStart={handleStart} onReview={handleReview} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}