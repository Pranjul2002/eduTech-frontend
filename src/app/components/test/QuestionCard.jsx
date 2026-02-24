"use client";
import { useState } from "react";
import styles from "../../test/page.module.css";
export default function QuestionCard({ question, onAnswer }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (option) => {
    setSelected(option);
    onAnswer(question.id, option);
  };

  return (
    <div className={styles.questionCard}>
      <h3>{question.question}</h3>

      {question.options.map((option, index) => (
        <button
          key={index}
          onClick={() => handleSelect(option)}
          className={`${styles.optionButton} ${
            selected === option ? styles.selected : ""
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}