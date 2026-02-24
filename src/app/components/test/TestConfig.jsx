"use client";
import { useState } from "react";
import styles from "../../test/page.module.css";
export default function TestConfig({ onStart }) {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [questionsPerPage, setQuestionsPerPage] = useState(1);
  const [duration, setDuration] = useState(10);
  const [customTime, setCustomTime] = useState("");

  const handleStart = () => {
    onStart({
      subject,
      topic,
      questionsPerPage: Number(questionsPerPage),
      duration: customTime ? Number(customTime) : duration,
    });
  };

  return (
    <div className={styles.configBox}>
      <h2>Test Configuration</h2>

      <select onChange={(e) => setSubject(e.target.value)}>
        <option value="">Select Subject</option>
        <option value="Math">Math</option>
        <option value="Science">Science</option>
        <option value="Computer Science">Computer Science</option>
    </select>

      <select onChange={(e) => setTopic(e.target.value)}>
      <option value="">Select Topic</option>
      <option value="Algebra">Algebra</option>
      <option value="Geometry">Geometry</option>
      <option value="Physics">Physics</option>
      <option value="Chemistry">Chemistry</option>
      <option value="Programming">Programming</option>
      <option value="DBMS">DBMS</option>
    </select>

      <select onChange={(e) => setQuestionsPerPage(e.target.value)}>
        <option value="1">1 Question</option>
        <option value="2">2 Questions</option>
      </select>

      <select onChange={(e) => setDuration(e.target.value )}>
        <option value="5">5 Sec</option>
        <option value="10">10 Sec</option>
        <option value="15">15 Sec</option>
        <option value="30">30 Sec</option>
      </select>

      <input
        type="number"
        placeholder="Custom Seconds"
        onChange={(e) => setCustomTime(e.target.value)}
      />

      <button className={styles.buttonPrimary}
      onClick={handleStart}>Start Test</button>
    </div>
  );
}