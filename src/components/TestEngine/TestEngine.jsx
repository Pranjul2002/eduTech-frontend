"use client";

/**
 * TestEngine.jsx
 * ─────────────────────────────────────────────────────────────────
 * Drop-in full-screen test environment.
 *
 * Props:
 *   test        – { id, title, subject, duration }  (duration in minutes)
 *   questions   – StudentQuestionResponse[]
 *   onSubmit    – async (payload) => SubmitTestResponse
 *   onClose     – () => void   (called after analysis is dismissed)
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./TestEngine.module.css";

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, "0"); }

function fmtSeconds(s) {
  const h   = Math.floor(s / 3600);
  const m   = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${pad(h)}:${pad(m)}:${pad(sec)}`
    : `${pad(m)}:${pad(sec)}`;
}

// ─────────────────────────────────────────────────────────────────
// Professional linear timer
// ─────────────────────────────────────────────────────────────────
function LinearTimer({ seconds, total }) {
  const pct    = Math.max(0, (seconds / total) * 100);
  const isLow  = seconds <= total * 0.25;
  const isCrit = seconds <= 60;
  const barColor = isCrit ? "#dc2626" : isLow ? "#d97706" : "#1a1a2e";

  return (
    <div className={styles.timerBlock}>
      <div className={styles.timerFace}>
        <span className={styles.timerLabel}>TIME REMAINING</span>
        <span className={styles.timerDigits} style={{ color: barColor }}>
          {fmtSeconds(seconds)}
        </span>
      </div>
      <div className={styles.timerTrack}>
        <div
          className={styles.timerBar}
          style={{
            width: `${pct}%`,
            background: barColor,
            transition: "width 1s linear, background 0.4s ease",
          }}
        />
        <div className={styles.timerTick} style={{ left: "75%" }} />
        <div className={styles.timerTick} style={{ left: "50%" }} />
        <div className={styles.timerTick} style={{ left: "25%" }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Fullscreen warning modal
// ─────────────────────────────────────────────────────────────────
function FsWarning({ count, onResume, onForceSubmit }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.warningModal}>
        <div className={styles.warningStripe} />
        <div className={styles.warningContent}>
          <h2 className={styles.warningTitle}>Fullscreen Exited</h2>
          <p className={styles.warningBody}>
            {count >= 2
              ? "This is your final warning. Leaving fullscreen again will automatically submit your test."
              : "You have exited fullscreen mode. Please return to fullscreen to continue your test."}
          </p>
          <div className={styles.warningMeta}>Warning {count} of 2</div>
          <div className={styles.warningActions}>
            <button className={styles.resumeBtn} onClick={onResume}>
              Return to Fullscreen
            </button>
            <button className={styles.forceSubmitBtn} onClick={onForceSubmit}>
              Submit Test Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Confirm submit modal
// ─────────────────────────────────────────────────────────────────
function ConfirmSubmit({ unanswered, total, onConfirm, onCancel }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.confirmModal}>
        <h2 className={styles.confirmTitle}>Submit Test</h2>
        <div className={styles.confirmStats}>
          <div className={styles.confirmStat}>
            <span className={styles.confirmStatVal} style={{ color: "#16a34a" }}>
              {total - unanswered}
            </span>
            <span className={styles.confirmStatLbl}>Answered</span>
          </div>
          <div className={styles.confirmDivider} />
          <div className={styles.confirmStat}>
            <span
              className={styles.confirmStatVal}
              style={{ color: unanswered > 0 ? "#dc2626" : "#16a34a" }}
            >
              {unanswered}
            </span>
            <span className={styles.confirmStatLbl}>Unanswered</span>
          </div>
        </div>
        <p className={styles.confirmBody}>
          {unanswered > 0
            ? `${unanswered} question${unanswered > 1 ? "s" : ""} left unanswered. Once submitted, answers cannot be changed.`
            : "All questions answered. Ready to submit?"}
        </p>
        <div className={styles.confirmActions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Review Answers</button>
          <button className={styles.confirmBtn} onClick={onConfirm}>Submit Test</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Analysis screen
// ─────────────────────────────────────────────────────────────────
function Analysis({ result, questions, answers, testTitle, timeTaken, onClose }) {
  const [tab, setTab] = useState("overview");

  const pct         = result.totalMarks > 0 ? Math.round((result.score / result.totalMarks) * 100) : 0;
  const passed      = pct >= 40;
  const unattempted = result.totalQuestions - result.attemptedQuestions;
  const accuracy    = result.attemptedQuestions > 0
    ? Math.round((result.correctAnswers / result.attemptedQuestions) * 100) : 0;

  const reviewed    = questions.map((q) => {
    const given     = answers[q.id] || null;
    const correct   = q.correctAnswer;
    const isCorrect = given === correct;
    const isSkipped = !given;
    return { ...q, given, correct, isCorrect, isSkipped };
  });

  const correctList = reviewed.filter((q) => q.isCorrect);
  const wrongList   = reviewed.filter((q) => !q.isCorrect && !q.isSkipped);
  const skippedList = reviewed.filter((q) => q.isSkipped);

  return (
    <div className={styles.analysisRoot}>

      {/* Header */}
      <div className={styles.analysisHeader}>
        <div className={styles.analysisHeaderInner}>
          <div className={styles.resultLeft}>
            <div className={`${styles.resultVerdict} ${passed ? styles.verdictPass : styles.verdictFail}`}>
              {passed ? "PASSED" : "FAILED"}
            </div>
            <div>
              <h1 className={styles.resultTitle}>{testTitle}</h1>
              <p className={styles.resultSub}>Test completed · {fmtSeconds(timeTaken)} taken</p>
            </div>
          </div>
          <div className={styles.resultScoreBox}>
            <span className={styles.resultScoreNum}>{result.score}</span>
            <span className={styles.resultScoreSep}>/</span>
            <span className={styles.resultScoreTotal}>{result.totalMarks}</span>
            <span className={styles.resultScorePct} style={{ color: passed ? "#16a34a" : "#dc2626" }}>
              {pct}%
            </span>
          </div>
        </div>
        <div className={styles.resultScoreBar}>
          <div
            className={styles.resultScoreBarFill}
            style={{ width: `${pct}%`, background: passed ? "#16a34a" : "#dc2626" }}
          />
        </div>
      </div>

      {/* Metric strip */}
      <div className={styles.metricStrip}>
        {[
          { label: "Total Questions", value: result.totalQuestions },
          { label: "Attempted",       value: result.attemptedQuestions },
          { label: "Correct",         value: result.correctAnswers,  color: "#16a34a" },
          { label: "Wrong",           value: result.wrongAnswers,    color: "#dc2626" },
          { label: "Skipped",         value: unattempted,            color: "#d97706" },
          { label: "Accuracy",        value: `${accuracy}%`,        color: "#2563eb" },
          { label: "Score",           value: `${pct}%`,             color: passed ? "#16a34a" : "#dc2626" },
          { label: "Time Taken",      value: fmtSeconds(timeTaken) },
        ].map(({ label, value, color }) => (
          <div key={label} className={styles.metricCard}>
            <span className={styles.metricVal} style={color ? { color } : undefined}>{value}</span>
            <span className={styles.metricLbl}>{label}</span>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className={styles.barSection}>
        {[
          { label: "Correct", value: result.correctAnswers, color: "#16a34a" },
          { label: "Wrong",   value: result.wrongAnswers,   color: "#dc2626" },
          { label: "Skipped", value: unattempted,           color: "#d97706" },
        ].map(({ label, value, color }) => (
          <div key={label} className={styles.barRow}>
            <span className={styles.barRowLabel}>{label}</span>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${(value / result.totalQuestions) * 100}%`, background: color }}
              />
            </div>
            <span className={styles.barRowCount} style={{ color }}>{value}/{result.totalQuestions}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={styles.analysisTabs}>
        {[["overview", "Overview"], ["review", "Question Review"]].map(([key, label]) => (
          <button
            key={key}
            className={`${styles.analysisTab} ${tab === key ? styles.activeAnalysisTab : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === "overview" && (
        <div className={styles.overviewGrid}>
          {[
            { title: "Correct",  list: correctList,  color: "#16a34a" },
            { title: "Wrong",    list: wrongList,    color: "#dc2626" },
            { title: "Skipped",  list: skippedList,  color: "#d97706" },
          ].map(({ title, list, color }) => (
            <div key={title} className={styles.overviewCard} style={{ "--card-accent": color }}>
              <div className={styles.ovHeader}>
                <span className={styles.ovTitle} style={{ color }}>{title}</span>
                <span className={styles.ovCount} style={{ background: `${color}18`, color }}>{list.length}</span>
              </div>
              {list.length === 0
                ? <p className={styles.ovEmpty}>None</p>
                : list.map((q) => (
                  <div key={q.id} className={styles.ovItem}>
                    <span className={styles.ovNum}>Q{questions.indexOf(q) + 1}</span>
                    <span className={styles.ovText}>{q.questionText}</span>
                    {(title === "Wrong" || title === "Skipped") && (
                      <div className={styles.ovAnswerRow}>
                        {title === "Wrong" && (
                          <span className={styles.ovAnswerTag} style={{ background: "#fee2e2", color: "#dc2626" }}>
                            Your answer: {q.given}
                          </span>
                        )}
                        <span className={styles.ovAnswerTag} style={{ background: "#dcfce7", color: "#16a34a" }}>
                          Correct: {q.correct}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}

      {/* Review tab */}
      {tab === "review" && (
        <div className={styles.reviewList}>
          {reviewed.map((q, idx) => {
            const opts      = [
              { l: "A", t: q.optionA },
              { l: "B", t: q.optionB },
              { l: "C", t: q.optionC },
              { l: "D", t: q.optionD },
            ];
            const state     = q.isSkipped ? "skipped" : q.isCorrect ? "correct" : "wrong";
            const stateColor = { correct: "#16a34a", wrong: "#dc2626", skipped: "#d97706" }[state];
            const stateLabel = { correct: "Correct",  wrong: "Incorrect",  skipped: "Skipped" }[state];

            return (
              <div key={q.id} className={styles.reviewItem} style={{ "--item-color": stateColor }}>
                <div className={styles.reviewQHead}>
                  <span className={styles.reviewQNum}>Q{idx + 1}</span>
                  <span
                    className={styles.reviewBadge}
                    style={{ background: `${stateColor}15`, color: stateColor }}
                  >
                    {stateLabel}
                  </span>
                  <span className={styles.reviewMarks}>{q.marks} mark{q.marks !== 1 ? "s" : ""}</span>
                </div>
                <p className={styles.reviewQText}>{q.questionText}</p>
                <div className={styles.reviewOptions}>
                  {opts.map(({ l, t }) => {
                    const isCorrect = l === q.correct;
                    const isGiven   = l === q.given;
                    return (
                      <div
                        key={l}
                        className={`${styles.revOpt}
                          ${isCorrect ? styles.revOptCorrect : ""}
                          ${isGiven && !isCorrect ? styles.revOptWrong : ""}`}
                      >
                        <span className={styles.revOptLetter}>{l}</span>
                        <span className={styles.revOptText}>{t}</span>
                        <div className={styles.revTags}>
                          {isCorrect && (
                            <span className={styles.revTag} style={{ background: "#dcfce7", color: "#16a34a" }}>
                              Correct Answer
                            </span>
                          )}
                          {isGiven && !isCorrect && (
                            <span className={styles.revTag} style={{ background: "#fee2e2", color: "#dc2626" }}>
                              Your Answer
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.analysisFooter}>
        <button className={styles.closAnalysisBtn} onClick={onClose}>
          Back to Tests
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main TestEngine
// ─────────────────────────────────────────────────────────────────
export default function TestEngine({ test, questions, onSubmit, onClose }) {
  const totalSeconds = (test.duration || 30) * 60;

  const [answers,      setAnswers]      = useState({});
  const [marked,       setMarked]       = useState({});
  const [currentQ,     setCurrentQ]     = useState(0);
  const [timeLeft,     setTimeLeft]     = useState(totalSeconds);
  const [timeTaken,    setTimeTaken]    = useState(0);
  const [fsWarning,    setFsWarning]    = useState(false);
  const [fsLeaveCount, setFsLeaveCount] = useState(0);
  const [confirmOpen,  setConfirmOpen]  = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [result,       setResult]       = useState(null);
  const [error,        setError]        = useState("");

  const containerRef = useRef(null);
  const timerRef     = useRef(null);
  const timeTakenRef = useRef(0);
  const answersRef   = useRef({});

  useEffect(() => { answersRef.current = answers; }, [answers]);

  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  }, []);

  useEffect(() => {
    if (result) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); doSubmit(); return 0; }
        return prev - 1;
      });
      timeTakenRef.current += 1;
      setTimeTaken((p) => p + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement || !!document.webkitFullscreenElement;
      if (!isFs && !result) {
        setFsLeaveCount((prev) => {
          const next = prev + 1;
          if (next >= 3) { doSubmit(); }
          else { setFsWarning(true); }
          return next;
        });
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  useEffect(() => {
    return () => {
      if (document.fullscreenElement && document.exitFullscreen)
        document.exitFullscreen().catch(() => {});
    };
  }, []);

  const handleAnswer = useCallback((qId, letter) => {
    setAnswers((prev) => {
      const next = { ...prev, [qId]: letter };
      answersRef.current = next;
      return next;
    });
  }, []);

  const doSubmit = useCallback(async () => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    setError("");
    setFsWarning(false);
    setConfirmOpen(false);
    try {
      const payload = {
        answers: Object.entries(answersRef.current).map(([questionId, selectedAnswer]) => ({
          questionId: Number(questionId),
          selectedAnswer: String(selectedAnswer).toUpperCase(),
        })),
      };
      const res = await onSubmit(payload);
      setResult(res);
    } catch (e) {
      setError(e.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [onSubmit]);

  const resumeFs = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    setFsWarning(false);
  };

  const total      = questions.length;
  const answered   = Object.keys(answers).length;
  const unanswered = total - answered;
  const q          = questions[currentQ];
  const isTimeLow  = timeLeft <= totalSeconds * 0.25;
  const isTimeCrit = timeLeft <= 60;

  const opts = q ? [
    { l: "A", t: q.optionA },
    { l: "B", t: q.optionB },
    { l: "C", t: q.optionC },
    { l: "D", t: q.optionD },
  ] : [];

  // Analysis
  if (result) {
    return (
      <div className={styles.fsRoot} ref={containerRef}>
        <Analysis
          result={result}
          questions={questions}
          answers={answers}
          testTitle={test.title}
          timeTaken={timeTakenRef.current}
          onClose={() => {
            if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
            onClose();
          }}
        />
      </div>
    );
  }

  // Test-taking
  return (
    <div
      className={`${styles.fsRoot} ${isTimeCrit ? styles.fsRootCrit : isTimeLow ? styles.fsRootWarn : ""}`}
      ref={containerRef}
    >
      {fsWarning && (
        <FsWarning count={fsLeaveCount} onResume={resumeFs} onForceSubmit={doSubmit} />
      )}
      {confirmOpen && (
        <ConfirmSubmit
          unanswered={unanswered}
          total={total}
          onConfirm={doSubmit}
          onCancel={() => setConfirmOpen(false)}
        />
      )}

      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <div className={styles.examChip}>EXAM</div>
          <div className={styles.topTitleBlock}>
            <div className={styles.topTitle}>{test.title}</div>
            <div className={styles.topMeta}>{test.subject}</div>
          </div>
        </div>

        <LinearTimer seconds={timeLeft} total={totalSeconds} />

        <div className={styles.topRight}>
          <div className={styles.progressBlock}>
            <span className={styles.progressFraction}>
              {answered}<span className={styles.progressTotal}>/{total}</span>
            </span>
            <span className={styles.progressLabel}>answered</span>
          </div>
          <button
            className={styles.submitBarBtn}
            onClick={() => setConfirmOpen(true)}
            disabled={submitting}
          >
            {submitting ? "Submitting…" : "Submit Test"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={styles.mainArea}>
        <div className={styles.questionPanel}>
          {error && <div className={styles.errBanner}>{error}</div>}

          <div className={styles.qCardScroll}>
            <div className={styles.qCard}>
              <div className={styles.qMeta}>
                <div className={styles.qMetaLeft}>
                  <span className={styles.qNum}>Q{currentQ + 1}</span>
                  <span className={styles.qOf}>of {total}</span>
                </div>
                <span className={styles.qMarks}>{q?.marks} mark{q?.marks !== 1 ? "s" : ""}</span>
              </div>

              <p className={styles.qText}>{q?.questionText}</p>

              <div className={styles.optList}>
                {opts.map(({ l, t }) => {
                  const sel = answers[q.id] === l;
                  return (
                    <button
                      key={l}
                      className={`${styles.optBtn} ${sel ? styles.optSel : ""}`}
                      onClick={() => handleAnswer(q.id, l)}
                    >
                      <span className={styles.optLetter}>{l}</span>
                      <span className={styles.optText}>{t}</span>
                      {sel && <span className={styles.optCheckmark} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles.qNavBottom}>
            <button
              className={styles.qNavPrev}
              onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
              disabled={currentQ === 0}
            >
              ← Previous
            </button>
            <button
              className={`${styles.qNavMark} ${marked[q?.id] ? styles.qNavMarkActive : ""}`}
              onClick={() => setMarked((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
            >
              {marked[q?.id] ? "★ Marked" : "☆ Mark for Review"}
            </button>
            <button
              className={styles.qNavNext}
              onClick={() => setCurrentQ((p) => Math.min(total - 1, p + 1))}
              disabled={currentQ === total - 1}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>

          {/* ── Stats strip at very top ── */}
          <div className={styles.sideStatsTop}>
            <div className={styles.sideStatTop}>
              <span className={styles.sideStatTopVal} style={{ color: "#16a34a" }}>{answered}</span>
              <span className={styles.sideStatTopLbl}>Answered</span>
            </div>
            <div className={styles.sideStatTopDivider} />
            <div className={styles.sideStatTop}>
              <span className={styles.sideStatTopVal} style={{ color: "#dc2626" }}>{unanswered}</span>
              <span className={styles.sideStatTopLbl}>Unattempted</span>
            </div>
            <div className={styles.sideStatTopDivider} />
            <div className={styles.sideStatTop}>
              <span className={styles.sideStatTopVal} style={{ color: "#7c3aed" }}>
                {Object.values(marked).filter(Boolean).length}
              </span>
              <span className={styles.sideStatTopLbl}>For Review</span>
            </div>
          </div>

          {/* ── Question map ── */}
          <div className={styles.sideSection}>
            <div className={styles.sideHead}>Question Map</div>
            <div className={styles.legend}>
              {[
                { color: "#1a1a2e", label: "Current" },
                { color: "#16a34a", label: "Answered" },
                { color: "#7c3aed", label: "Marked for Review" },
                { color: "#f3f4f6", label: "Not Answered", border: "#d1d5db" },
              ].map(({ color, label, border }) => (
                <div key={label} className={styles.legendItem}>
                  <span
                    className={styles.legendDot}
                    style={{ background: color, border: border ? `1px solid ${border}` : "none" }}
                  />
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div className={styles.palette}>
              {questions.map((qs, idx) => {
                const isCur = idx === currentQ;
                const isAns = !!answers[qs.id];
                const isMrk = !!marked[qs.id];
                return (
                  <button
                    key={idx}
                    className={styles.palBtn}
                    style={{
                      background: isCur ? "#1a1a2e" : isMrk ? "#7c3aed" : isAns ? "#16a34a" : "#f3f4f6",
                      color: isCur || isAns || isMrk ? "#fff" : "#6b7280",
                      border: `2px solid ${isCur ? "#1a1a2e" : isMrk ? "#7c3aed" : isAns ? "#16a34a" : "#e5e7eb"}`,
                    }}
                    onClick={() => setCurrentQ(idx)}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            className={styles.sideSubmitBtn}
            onClick={() => setConfirmOpen(true)}
            disabled={submitting}
          >
            {submitting ? "Submitting…" : "Finish & Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}