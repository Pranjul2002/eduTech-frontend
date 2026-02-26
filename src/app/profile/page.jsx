"use client";

import { useEffect, useState } from "react";
import styles from "./profile.module.css";
import {
  FiUser,
  FiBook,
  FiFileText,
  FiBarChart2,
  FiSettings
} from "react-icons/fi";

export default function Profile() {

  // Original Courses (UNCHANGED)
  const courses = [
    { id: 1, title: "Physics Mock Tests", progress: 70 },
    { id: 2, title: "Maths PYQs", progress: 45 },
    { id: 3, title: "CS Practice", progress: 85 },
  ];

  // Test attempt state
  const [testData, setTestData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("testProgress");
    if (saved) {
      setTestData(JSON.parse(saved));
    }
  }, []);

  return (
    <div className={styles.layout}>
      
      {/* Desktop Sidebar */}
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>EdTech</h2>
        <nav className={styles.nav}>
          <a className={`${styles.navItem} ${styles.active}`}>
            <FiUser /> <span>Profile</span>
          </a>
          <a className={styles.navItem}>
            <FiBook /> <span>My Courses</span>
          </a>
          <a className={styles.navItem}>
            <FiFileText /> <span>Tests</span>
          </a>
          <a className={styles.navItem}>
            <FiBarChart2 /> <span>Results</span>
          </a>
          <a className={styles.navItem}>
            <FiSettings /> <span>Settings</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
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
        <div className={styles.profileCard}>
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
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <h3>12</h3>
            <p>Tests Attempted</p>
          </div>
          <div className={styles.statCard}>
            <h3>34 hrs</h3>
            <p>Learning Time</p>
          </div>
          <div className={styles.statCard}>
            <h3>5</h3>
            <p>Stars</p>
          </div>
        </div>

        {/* Courses (UNCHANGED) */}
        <section className={styles.courses}>
          <h3>Your Courses</h3>

          {courses.map((course) => (
            <div key={course.id} className={styles.courseCard}>
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

        {/* NEW: Test Attempts Section */}
        <section className={styles.testSection}>
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

              {!testData.completed ? (
                <button
                  className={styles.resumeBtn}
                  onClick={() => (window.location.href = "/test")}
                >
                  Resume Test
                </button>
              ) : (
                <button
                  className={styles.resumeBtn}
                  onClick={() => (window.location.href = "/test")}
                >
                  View Details
                </button>
              )}
            </div>
          ) : (
            <p className={styles.noTest}>No test attempts yet.</p>
          )}
        </section>

      </main>
    </div>
  );
}