"use client";
import { useState } from "react";
import TestConfig from "../components/test/TestConfig";
import Timer from "../components/test/Timer";
import QuestionCard from "../components/test/QuestionCard";
import questionsData from "../../data/questions";
import styles from "./page.module.css";

export default function TestPage() {
  const [config, setConfig] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  /* ===============================
     CONFIG SCREEN
  ================================ */
  if (!config) {
    return (
      <div className={styles.pageBackground}>
        <div className={styles.fullScreenWrapper}>
          <TestConfig onStart={setConfig} />
        </div>
      </div>
    );
  }

  const filteredQuestions = questionsData.filter(
    (q) =>
      (!config.subject || q.subject === config.subject) &&
      (!config.topic || q.topic === config.topic)
  );

  const start = currentPage * config.questionsPerPage;
  const end = start + config.questionsPerPage;
  const currentQuestions = filteredQuestions.slice(start, end);

  /* ===============================
     PER QUESTION TIMER HANDLER
  ================================ */
  const handleTimeUp = () => {
    const totalPages = Math.ceil(
      filteredQuestions.length / config.questionsPerPage
    );

    if (currentPage + 1 < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleAnswer = (id, option) => {
    setAnswers((prev) => ({ ...prev, [id]: option }));
  };

  /* ===============================
     RESULT SCREEN
  ================================ */
  if (isFinished) {
    const totalQuestions = filteredQuestions.length;
    const correctAnswers = filteredQuestions.filter(
      (q) => answers[q.id] === q.answer
    ).length;

    const percentage = Math.round(
      (correctAnswers / totalQuestions) * 100
    );

    let message = "";
    let suggestion = "";

    if (percentage >= 80) {
      message = "Outstanding Performance! 🚀";
      suggestion =
        "You have strong conceptual clarity. Try increasing difficulty level.";
    } else if (percentage >= 60) {
      message = "Great Job! 👍";
      suggestion =
        "You're doing well. Review minor mistakes and aim higher next time.";
    } else if (percentage >= 40) {
      message = "Good Effort 💪";
      suggestion =
        "Revise the topic once and practice a few more problems.";
    } else {
      message = "Keep Going 🌱";
      suggestion =
        "Don't worry! Revisit fundamentals and try again. Progress takes practice.";
    }

    return (
      <div className={styles.pageBackground}>
        <div className={styles.resultWrapper}>
          <div className={`${styles.resultCard} ${styles.fadeIn}`}>
            <div className={styles.successIcon}>🎉</div>

            <h2>{message}</h2>

            <p className={styles.score}>
              Score: <span>{correctAnswers}</span> / {totalQuestions}
            </p>

            <p className={styles.percentage}>{percentage}%</p>

            <p className={styles.suggestion}>{suggestion}</p>

            <button
              className={styles.buttonPrimary}
              onClick={() => {
                setIsFinished(false);
                setConfig(null);
                setAnswers({});
                setCurrentPage(0);
              }}
            >
              Retake Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ===============================
     TEST SCREEN
  ================================ */
  return (
    <div className={styles.pageBackground}>
      <div className={`${styles.testContainer} ${styles.fadeIn}`}>
        <Timer
          key={currentPage} // resets only on question change
          duration={config.duration}
          onTimeUp={handleTimeUp}
        />

        {currentQuestions.map((q) => (
          <QuestionCard
            key={q.id}
            question={q}
            onAnswer={handleAnswer}
          />
        ))}

        <div className={styles.navigation}>
          <button
            className={styles.buttonSecondary}
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </button>

          <button
            className={styles.buttonSecondary}
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={end >= filteredQuestions.length}
          >
            Next
          </button>
        </div>

        <button
          className={`${styles.buttonPrimary} ${styles.submitButton}`}
          onClick={() => setIsFinished(true)}
        >
          Submit Test
        </button>
      </div>
    </div>
  );
}