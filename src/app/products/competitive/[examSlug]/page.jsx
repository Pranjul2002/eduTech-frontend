"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import TestEngine from "@/components/TestEngine/TestEngine";
import styles from "./page.module.css";

// ── Exam metadata ──────────────────────────────────────────────────────────────

const EXAM_META = {
  jee: {
    title: "JEE Preparation",
    subtitle: "IIT JEE · Main & Advanced",
    description: "Rank-oriented preparation with advanced problem sets across Physics, Chemistry, and Mathematics.",
    icon: "⚙️",
    accentColor: "#dc2626",
    bgColor: "#fff5f5",
    borderColor: "#fecaca",
    tagColor: "#dc2626",
    subjects: [
      { key: "physics",   label: "Physics",     emoji: "⚡", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
      { key: "chemistry", label: "Chemistry",   emoji: "🧪", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
      { key: "maths",     label: "Mathematics", emoji: "📐", color: "#7c3aed", bg: "#faf5ff", border: "#ddd6fe" },
    ],
    duration: 180,
  },
  neet: {
    title: "NEET Preparation",
    subtitle: "Medical Entrance · NTA Pattern",
    description: "Biology-focused preparation with NTA-style mocks across Physics, Biology, and Chemistry.",
    icon: "🩺",
    accentColor: "#059669",
    bgColor: "#ecfdf5",
    borderColor: "#a7f3d0",
    tagColor: "#059669",
    subjects: [
      { key: "physics",   label: "Physics",   emoji: "⚡", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
      { key: "biology",   label: "Biology",   emoji: "🌿", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
      { key: "chemistry", label: "Chemistry", emoji: "🧪", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    ],
    duration: 180,
  },
  gate: {
    title: "GATE Preparation",
    subtitle: "Graduate Aptitude Test in Engineering",
    description: "Comprehensive 65-question GATE-pattern test covering Engineering Mathematics, CS fundamentals, Networks, and OS.",
    icon: "🎓",
    accentColor: "#0891b2",
    bgColor: "#ecfeff",
    borderColor: "#a5f3fc",
    tagColor: "#0891b2",
    subjects: [
      { key: "general", label: "Full GATE Test", emoji: "🎓", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
    ],
    duration: 180,
  },
};

// ── API ────────────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchPrepTests(exam) {
  const res = await fetch(`${API_BASE}/api/prep/${exam}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load exam tests");
  return res.json();
}

async function fetchTestQuestions(testId) {
  const res = await fetch(`${API_BASE}/api/tests/${testId}/questions`, { credentials: "include" });
  if (res.status === 401) throw Object.assign(new Error("auth"), { isAuth: true });
  if (!res.ok) throw new Error("Failed to load questions");
  return res.json();
}

async function submitTest(testId, answers) {
  const res = await fetch(`${API_BASE}/api/tests/${testId}/submit`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) throw new Error("Submission failed");
  return res.json();
}

// ── Subject card ──────────────────────────────────────────────────────────────

function SubjectCard({ subject, testInfo, loading, onStart }) {
  const hasTest = testInfo != null;
  const questionCount = testInfo?.questionCount ?? 0;

  return (
    <div
      className={styles.subjectCard}
      style={{ "--s-color": subject.color, "--s-bg": subject.bg, "--s-border": subject.border }}
    >
      <div className={styles.subjectCardTop}>
        <div className={styles.subjectEmoji}>{subject.emoji}</div>
        <div className={styles.subjectInfo}>
          <h3 className={styles.subjectName}>{subject.label}</h3>
          <span className={styles.subjectMeta}>
            {loading ? "Loading…" : hasTest ? `${questionCount} questions · Free` : "Coming soon"}
          </span>
        </div>
        <div className={styles.subjectBadge} style={{ background: subject.bg, color: subject.color, border: `1px solid ${subject.border}` }}>
          FREE
        </div>
      </div>

      <div className={styles.subjectCardBottom}>
        {hasTest && (
          <div className={styles.subjectStats}>
            <span className={styles.subjectStat}>
              <span className={styles.subjectStatIcon}>📝</span>
              {questionCount} MCQs
            </span>
            <span className={styles.subjectStat}>
              <span className={styles.subjectStatIcon}>⏱</span>
              ~{Math.ceil(questionCount * 1.5)} min
            </span>
            <span className={styles.subjectStat}>
              <span className={styles.subjectStatIcon}>✅</span>
              Instant result
            </span>
          </div>
        )}

        <button
          className={styles.startBtn}
          style={{ background: hasTest ? subject.color : "#9ca3af" }}
          onClick={() => hasTest && onStart(testInfo.id, subject.label)}
          disabled={!hasTest || loading}
          title={!hasTest ? "Test not available yet" : `Start ${subject.label} test`}
        >
          {loading ? "Loading…" : hasTest ? "Start Test →" : "Coming Soon"}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CompetitiveExamPage() {
  const params = useParams();
  const router = useRouter();
  const examSlug = params?.examSlug?.toLowerCase();
  const exam = EXAM_META[examSlug];

  const [prepTests, setPrepTests]   = useState([]);  // [{id, title, questionCount}]
  const [loadingTests, setLoading]  = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Active test state
  const [activeTest, setActiveTest]       = useState(null);  // { id, title, subject, duration }
  const [activeQuestions, setQuestions]   = useState([]);
  const [loadingTest, setLoadingTest]     = useState(false);
  const [testError, setTestError]         = useState("");

  // Fetch prep test list on mount
  useEffect(() => {
    if (!exam) return;
    setLoading(true);
    fetchPrepTests(examSlug)
      .then(setPrepTests)
      .catch((e) => setFetchError(e.message))
      .finally(() => setLoading(false));
  }, [examSlug]);

  // Map subject key → test info by matching title
  const getTestForSubject = useCallback((subjectKey) => {
    if (!prepTests.length) return null;
    // Match by title keywords
    const keyMap = {
      physics:   "Physics",
      chemistry: "Chemistry",
      maths:     "Mathematics",
      biology:   "Biology",
      general:   "GATE",
    };
    const keyword = keyMap[subjectKey] || subjectKey;
    return prepTests.find((t) => t.title.includes(keyword)) ?? null;
  }, [prepTests]);

  // Start a test
  const handleStart = useCallback(async (testId, subjectLabel) => {
    setLoadingTest(true);
    setTestError("");
    try {
      const questions = await fetchTestQuestions(testId);
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("No questions available for this test.");
      }
      setActiveTest({
        id: testId,
        title: `${exam.title} — ${subjectLabel}`,
        subject: subjectLabel,
        duration: exam.duration,
      });
      setQuestions(questions);
    } catch (e) {
      if (e.isAuth) {
        router.push("/auth");
        return;
      }
      setTestError(e.message || "Failed to start test.");
    } finally {
      setLoadingTest(false);
    }
  }, [exam, router]);

  // TestEngine submit wrapper
  const handleSubmit = useCallback(async (payload) => {
    return submitTest(activeTest.id, payload.answers);
  }, [activeTest]);

  const handleClose = useCallback(() => {
    setActiveTest(null);
    setQuestions([]);
  }, []);

  // ── 404 for unknown exam ──
  if (!exam) {
    return (
      <main className={styles.page}>
        <div className={styles.notFound}>
          <span className={styles.notFoundIcon}>🔍</span>
          <h1>Exam not found</h1>
          <p>The exam you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/products" className={styles.backLinkLarge}>← Back to Products</Link>
        </div>
      </main>
    );
  }

  // ── Full-screen TestEngine ──
  if (activeTest && activeQuestions.length > 0) {
    return (
      <TestEngine
        test={activeTest}
        questions={activeQuestions}
        onSubmit={handleSubmit}
        onClose={handleClose}
      />
    );
  }

  return (
    <main className={styles.page}>

      {/* ── Top navigation ── */}
      <div className={styles.topBar}>
        <Link href="/products" className={styles.backLink}>← Back to Products</Link>
        <nav className={styles.breadcrumb}>
          <Link href="/products" className={styles.breadLink}>Products</Link>
          <span className={styles.sep}>›</span>
          <Link href="/products" className={styles.breadLink}>Competitive</Link>
          <span className={styles.sep}>›</span>
          <span className={styles.breadCurrent}>{exam.title}</span>
        </nav>
      </div>

      {/* ── Hero ── */}
      <div className={styles.hero} style={{ "--exam-color": exam.accentColor, "--exam-bg": exam.bgColor, "--exam-border": exam.borderColor }}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <div className={styles.heroIcon}>{exam.icon}</div>
            <div>
              <div className={styles.heroEyebrow} style={{ color: exam.accentColor }}>COMPETITIVE PREP</div>
              <h1 className={styles.heroTitle}>{exam.title}</h1>
              <p className={styles.heroSubtitle}>{exam.subtitle}</p>
              <p className={styles.heroDesc}>{exam.description}</p>
            </div>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatVal} style={{ color: exam.accentColor }}>{exam.subjects.length}</span>
              <span className={styles.heroStatLbl}>Subjects</span>
            </div>
            <div className={styles.heroStatDiv} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatVal} style={{ color: exam.accentColor }}>
                {examSlug === "gate" ? "65" : `${exam.subjects.length * 15}`}
              </span>
              <span className={styles.heroStatLbl}>Questions</span>
            </div>
            <div className={styles.heroStatDiv} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatVal} style={{ color: exam.accentColor }}>FREE</span>
              <span className={styles.heroStatLbl}>Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Error states ── */}
      {fetchError && (
        <div className={styles.errorBanner}>
          <span>⚠️</span> {fetchError}
        </div>
      )}
      {testError && (
        <div className={styles.errorBanner}>
          <span>⚠️</span> {testError}
          <button className={styles.errorClose} onClick={() => setTestError("")}>✕</button>
        </div>
      )}
      {loadingTest && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
          <p>Loading test questions…</p>
        </div>
      )}

      {/* ── Subject tests grid ── */}
      <div className={styles.content}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Available Tests</h2>
          <p className={styles.sectionSub}>
            All tests are free for every registered user. Log in to access your questions and get instant results.
          </p>
        </div>

        <div className={styles.subjectsGrid}>
          {exam.subjects.map((subject) => {
            const testInfo = getTestForSubject(subject.key);
            return (
              <SubjectCard
                key={subject.key}
                subject={subject}
                testInfo={testInfo}
                loading={loadingTests}
                onStart={handleStart}
              />
            );
          })}
        </div>

        {/* ── Info strip ── */}
        <div className={styles.infoStrip}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🔒</span>
            <div>
              <strong>Login required to take tests</strong>
              <p>Create a free account or log in — no payment needed.</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📊</span>
            <div>
              <strong>Instant analytics</strong>
              <p>Score breakdown, accuracy, and per-question review immediately after submission.</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🔄</span>
            <div>
              <strong>Unlimited retakes</strong>
              <p>Practise as many times as you like — each attempt is tracked separately.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}