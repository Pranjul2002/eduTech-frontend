"use client";

import { useState, useRef, useCallback } from "react";
import {
  BrainCircuit, Upload, CheckCircle2, XCircle,
  RotateCcw, ChevronDown, ChevronUp, Loader2,
  FileUp, Pencil, Trophy, ClipboardList
} from "lucide-react";
import styles from "./AssessmentPanel.module.css";
import { useFiles } from "../../context/FileContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ─── helpers ──────────────────────────────────────────────────────────────────

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

// ─── sub-components ───────────────────────────────────────────────────────────

function ScoreBadge({ score }) {
  const color = score >= 80 ? "excellent" : score >= 50 ? "good" : "poor";
  return (
    <div className={`${styles.scoreBadge} ${styles[`score_${color}`]}`}>
      <Trophy size={18} />
      <span>{score}%</span>
    </div>
  );
}

function QuestionCard({ result, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.qCard} ${result.correct ? styles.qCorrect : styles.qWrong}`}>
      <button
        className={styles.qHeader}
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <div className={styles.qHeaderLeft}>
          {result.correct
            ? <CheckCircle2 size={18} className={styles.iconCorrect} />
            : <XCircle size={18} className={styles.iconWrong} />}
          <span className={styles.qNum}>Q{result.questionNumber}</span>
          <span className={styles.qText}>{result.questionText}</span>
        </div>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className={styles.qBody}>
          <div className={styles.qSection}>
            <div className={styles.qLabel}>Your answer</div>
            <div className={styles.qAnswer}>{result.studentAnswer || "—"}</div>
          </div>
          {!result.correct && (
            <div className={styles.qSection}>
              <div className={styles.qLabel}>Correct answer</div>
              <div className={`${styles.qAnswer} ${styles.qAnswerCorrect}`}>
                {result.correctAnswer}
              </div>
            </div>
          )}
          <div className={styles.qSection}>
            <div className={styles.qLabel}>Feedback</div>
            <div className={styles.qFeedback}>{result.feedback}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── answer input per question ────────────────────────────────────────────────

function AnswerInput({ question, onUpdate }) {
  const [mode, setMode] = useState("text"); // "text" | "upload"
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  const handleText = (e) => {
    setText(e.target.value);
    onUpdate(question.number, { type: "text", value: e.target.value });
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    onUpdate(question.number, { type: "file", value: f });
    e.target.value = "";
  };

  return (
    <div className={styles.answerWrap}>
      <div className={styles.answerModeRow}>
        <button
          type="button"
          className={`${styles.modeBtn} ${mode === "text" ? styles.modeBtnActive : ""}`}
          onClick={() => setMode("text")}
        >
          <Pencil size={13} /> Type answer
        </button>
        <button
          type="button"
          className={`${styles.modeBtn} ${mode === "upload" ? styles.modeBtnActive : ""}`}
          onClick={() => setMode("upload")}
        >
          <FileUp size={13} /> Upload handwritten
        </button>
      </div>

      {mode === "text" ? (
        <textarea
          className={styles.answerTextarea}
          placeholder="Write your answer here…"
          value={text}
          onChange={handleText}
          rows={3}
        />
      ) : (
        <div
          className={styles.uploadZone}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) { setFile(f); onUpdate(question.number, { type: "file", value: f }); }
          }}
        >
          {file ? (
            <span className={styles.uploadFileName}><CheckCircle2 size={14} /> {file.name}</span>
          ) : (
            <>
              <Upload size={18} className={styles.uploadIcon} />
              <span>Drop PDF or image here, or click to browse</span>
              <span className={styles.uploadHint}>Supports PDF, JPG, PNG</span>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            hidden
            accept=".pdf,image/jpeg,image/png,image/jpg"
            onChange={handleFile}
          />
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AssessmentPanel() {
  const { activeSource } = useFiles();

  const [step, setStep] = useState("idle"); // idle | generating | answering | evaluating | results
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { questionNumber: { type, value } }
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [count, setCount] = useState(5);
  const [topic, setTopic] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const isReady = activeSource?.status === "ready";

  // ── Step 1: Generate questions ──────────────────────────────────────────────
  const generate = useCallback(async () => {
    if (!isReady || !activeSource?.backendId) return;
    setError("");
    setStep("generating");
    try {
      const data = await apiPost("/api/assessment/generate", {
        sourceId: Number(activeSource.backendId),
        count,
        topic: topic.trim() || undefined,
      });
      setQuestions(data.questions || []);
      setAnswers({});
      setCurrentIndex(0);
      setStep("answering");
    } catch (err) {
      setError(err.message);
      setStep("idle");
    }
  }, [activeSource, count, isReady, topic]);

  // ── Step 2: Update a single answer ─────────────────────────────────────────
  const updateAnswer = useCallback((qNum, payload) => {
    setAnswers((prev) => ({ ...prev, [qNum]: payload }));
  }, []);

  // ── Step 3: Evaluate all answers ────────────────────────────────────────────
  const evaluate = useCallback(async () => {
    if (!activeSource?.backendId) return;
    setError("");
    setStep("evaluating");

    try {
      // Build the answers array — convert files to base64 inline
      const answersPayload = await Promise.all(
        questions.map(async (q) => {
          const ans = answers[q.number];
          const base = {
            questionNumber: q.number,
            questionText: q.question,
          };

          if (!ans) return { ...base, textAnswer: "" };

          if (ans.type === "text") {
            return { ...base, textAnswer: ans.value };
          }

          // File — encode to base64
          const file = ans.value;
          const b64 = await toBase64(file);
          return {
            ...base,
            handwrittenBase64: b64,
            handwrittenMimeType: file.type || "application/octet-stream",
          };
        })
      );

      const data = await apiPost("/api/assessment/evaluate", {
        sourceId: Number(activeSource.backendId),
        answers: answersPayload,
      });

      setResults(data);
      setStep("results");
    } catch (err) {
      setError(err.message);
      setStep("answering");
    }
  }, [activeSource, answers, questions]);

  // ── Reset ───────────────────────────────────────────────────────────────────
  const reset = () => {
    setStep("idle");
    setQuestions([]);
    setAnswers({});
    setResults(null);
    setError("");
    setCurrentIndex(0);
  };

  // ── Answered count ──────────────────────────────────────────────────────────
  const answeredCount = Object.values(answers).filter(
    (a) => a && ((a.type === "text" && a.value?.trim()) || (a.type === "file" && a.value))
  ).length;

  // ─────────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  if (!activeSource) {
    return (
      <div className={styles.empty}>
        <BrainCircuit size={32} className={styles.emptyIcon} />
        <p>Select a source to start an assessment</p>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className={styles.empty}>
        <Loader2 size={28} className={styles.spin} />
        <p>Waiting for source to finish processing…</p>
      </div>
    );
  }

  return (
    <section className={styles.panel}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <BrainCircuit size={16} className={styles.headerIcon} />
          <h2 className={styles.title}>Assessment</h2>
        </div>
        <div className={styles.sourceChip}>
          <ClipboardList size={12} />
          <span>{activeSource.name}</span>
        </div>
      </div>

      {/* ── Error banner ───────────────────────────────────── */}
      {error && (
        <div className={styles.errorBanner}>
          <XCircle size={15} /> {error}
        </div>
      )}

      {/* ══ STEP: idle ════════════════════════════════════════ */}
      {step === "idle" && (
        <div className={styles.setupCard}>
          <p className={styles.setupLead}>
            AI will read your uploaded document and generate exam questions for you to answer.
          </p>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>Number of questions</label>
            <div className={styles.countPills}>
              {[3, 5, 8, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`${styles.countPill} ${count === n ? styles.countPillActive : ""}`}
                  onClick={() => setCount(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel} htmlFor="topic-input">
              Topic focus <span className={styles.optional}>(optional)</span>
            </label>
            <input
              id="topic-input"
              className={styles.topicInput}
              placeholder="e.g. Chapter 3, photosynthesis, World War II…"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <button className={styles.primaryBtn} onClick={generate} type="button">
            <BrainCircuit size={15} /> Generate questions
          </button>
        </div>
      )}

      {/* ══ STEP: generating ══════════════════════════════════ */}
      {step === "generating" && (
        <div className={styles.loadingState}>
          <Loader2 size={28} className={styles.spin} />
          <p>AI is reading the document and preparing questions…</p>
        </div>
      )}

      {/* ══ STEP: answering ═══════════════════════════════════ */}
      {step === "answering" && (() => {
        const q = questions[currentIndex];
        const isFirst = currentIndex === 0;
        const isLast  = currentIndex === questions.length - 1;
        const currentAnswered = answers[q?.number];
        const currentHasAnswer = currentAnswered &&
          ((currentAnswered.type === "text" && currentAnswered.value?.trim()) ||
           (currentAnswered.type === "file" && currentAnswered.value));

        return (
          <div className={styles.answering}>
            {/* Progress bar */}
            <div className={styles.progressRow}>
              <span className={styles.progressLabel}>
                {answeredCount} / {questions.length} answered
              </span>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${Math.round((answeredCount / questions.length) * 100)}%` }}
                />
              </div>
            </div>

            {/* Step indicator dots */}
            <div className={styles.stepDots}>
              {questions.map((_, i) => {
                const ans = answers[questions[i]?.number];
                const done = ans && ((ans.type === "text" && ans.value?.trim()) || (ans.type === "file" && ans.value));
                return (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.stepDot} ${i === currentIndex ? styles.stepDotActive : ""} ${done ? styles.stepDotDone : ""}`}
                    onClick={() => setCurrentIndex(i)}
                    title={`Question ${i + 1}`}
                  />
                );
              })}
            </div>

            {/* Single question */}
            <div className={styles.questionList}>
              {q && (
                <div className={styles.questionBlock}>
                  <div className={styles.questionHeader}>
                    <span className={styles.questionNum}>Q{q.number}</span>
                    <span className={styles.questionText}>{q.question}</span>
                  </div>
                  <AnswerInput key={q.number} question={q} onUpdate={updateAnswer} />
                </div>
              )}
            </div>

            {/* Navigation row */}
            <div className={styles.navRow}>
              <button
                className={styles.ghostBtn}
                onClick={reset}
                type="button"
              >
                <RotateCcw size={14} /> Start over
              </button>

              <div className={styles.navBtns}>
                <button
                  className={styles.navBtn}
                  type="button"
                  disabled={isFirst}
                  onClick={() => setCurrentIndex((i) => i - 1)}
                >
                  ← Previous
                </button>

                {isLast ? (
                  <button
                    className={styles.primaryBtn}
                    onClick={evaluate}
                    disabled={answeredCount === 0}
                    type="button"
                    style={{ width: "auto", padding: "9px 20px" }}
                  >
                    Submit & evaluate
                  </button>
                ) : (
                  <button
                    className={styles.navBtnNext}
                    type="button"
                    onClick={() => setCurrentIndex((i) => i + 1)}
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ══ STEP: evaluating ══════════════════════════════════ */}
      {step === "evaluating" && (
        <div className={styles.loadingState}>
          <Loader2 size={28} className={styles.spin} />
          <p>AI is checking your answers against the document…</p>
        </div>
      )}

      {/* ══ STEP: results ═════════════════════════════════════ */}
      {step === "results" && results && (
        <div className={styles.results}>
          <div className={styles.resultsSummary}>
            <ScoreBadge score={results.score} />
            <div className={styles.summaryStats}>
              <span className={styles.statCorrect}>
                <CheckCircle2 size={14} /> {results.correctCount} correct
              </span>
              <span className={styles.statWrong}>
                <XCircle size={14} /> {results.wrongCount} wrong
              </span>
              <span className={styles.statTotal}>
                {results.totalQuestions} total
              </span>
            </div>
          </div>

          <div className={styles.resultsList}>
            {results.results.map((r, i) => (
              <QuestionCard key={r.questionNumber} result={r} index={i} />
            ))}
          </div>

          <button className={styles.primaryBtn} onClick={reset} type="button" style={{ marginTop: "1rem" }}>
            <RotateCcw size={14} /> Try another assessment
          </button>
        </div>
      )}
    </section>
  );
}