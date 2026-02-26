"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./profile.module.css";
import {
  FiUser,
  FiBook,
  FiFileText,
  FiBarChart2,
  FiSettings
} from "react-icons/fi";

export default function Profile() {

  const courses = [
    { id: 1, title: "Physics Mock Tests", progress: 70 },
    { id: 2, title: "Maths PYQs", progress: 45 },
    { id: 3, title: "CS Practice", progress: 85 },
  ];

  const [testData, setTestData] = useState(null);

  // Animated Stats
  const [stats, setStats] = useState({
    tests: 0,
    hours: 0,
    stars: 0
  });

  const statsRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("testProgress");
    if (saved) {
      setTestData(JSON.parse(saved));
    }
  }, []);

  // Scroll Reveal + Counter Animation
  useEffect(() => {
    const elements = document.querySelectorAll(`.${styles.reveal}`);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.activeReveal);

            // Start counter animation when stats visible
            if (entry.target === statsRef.current) {
              animateCounters();
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const animateCounters = () => {
    let start = 0;
    const interval = setInterval(() => {
      start += 1;
      setStats({
        tests: Math.min(start, 12),
        hours: Math.min(start * 3, 34),
        stars: Math.min(Math.floor(start / 3), 5)
      });
      if (start >= 12) clearInterval(interval);
    }, 80);
  };

  return (
    <div className={styles.layout}>
      
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>EdTech</h2>
        <nav className={styles.nav}>
          <a className={`${styles.navItem} ${styles.active}`}>
            <FiUser /> <span>Profile</span>
          </a>
          <a className={styles.navItem}><FiBook /> <span>My Courses</span></a>
          <a className={styles.navItem}><FiFileText /> <span>Tests</span></a>
          <a className={styles.navItem}><FiBarChart2 /> <span>Results</span></a>
          <a className={styles.navItem}><FiSettings /> <span>Settings</span></a>
        </nav>
      </aside>

      {/* Main */}
      <main className={styles.main}>

        {/* Mobile Nav */}
        <div className={styles.mobileNav}>
          <FiUser />
          <FiBook />
          <FiFileText />
          <FiBarChart2 />
          <FiSettings />
        </div>

        {/* Profile Header */}
        <div className={`${styles.profileCard} ${styles.reveal}`}>
          <img
            src="image.png"
            alt="avatar"
            className={styles.avatar}
          />
          <div>
            <h2>Your Name</h2>
            <p>yourname@example.com</p>
            <span className={styles.plan}>Premium Member</span>
          </div>
        </div>

        {/* Stats */}
        <div
          ref={statsRef}
          className={`${styles.stats} ${styles.reveal}`}
        >
          <div className={styles.statCard}>
            <h3>{stats.tests}</h3>
            <p>Tests Attempted</p>
          </div>
          <div className={styles.statCard}>
            <h3>{stats.hours} hrs</h3>
            <p>Learning Time</p>
          </div>
          <div className={styles.statCard}>
            <h3>{stats.stars}</h3>
            <p>Stars</p>
          </div>
        </div>

        {/* Courses */}
        <section className={`${styles.courses} ${styles.reveal}`}>
          <h3>Your Courses</h3>

          {courses.map((course, index) => (
            <div
              key={course.id}
              className={styles.courseCard}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className={styles.courseTop}>
                <h4>{course.title}</h4>
                <span>{course.progress}%</span>
              </div>

              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${course.progress}%` }}
                />
              </div>

              <button className={styles.continueBtn}>
                Continue
              </button>
            </div>
          ))}
        </section>

        {/* Test Attempts */}
        <section className={`${styles.testSection} ${styles.reveal}`}>
          <h3>My Test Attempts</h3>

          {testData ? (
            <div className={styles.testCard}>
              <div>
                <p>
                  {testData.completed
                    ? `Score: ${testData.score}`
                    : "Incomplete Test"}
                </p>
              </div>

              <button
                className={styles.resumeBtn}
                onClick={() => (window.location.href = "/test")}
              >
                {testData.completed ? "View Details" : "Resume Test"}
              </button>
            </div>
          ) : (
            <p className={styles.noTest}>No test attempts yet.</p>
          )}
        </section>

      </main>
    </div>
  );
}