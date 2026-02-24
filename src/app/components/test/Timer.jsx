"use client";
import { useEffect, useState } from "react";
import styles from "../../test/page.module.css";

export default function Timer({ duration, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);

    // ❌ DO NOT include onTimeUp here
  }, [duration]);

  return (
    <div className={styles.timer}>
      ⏳ {timeLeft}s
    </div>
  );
}