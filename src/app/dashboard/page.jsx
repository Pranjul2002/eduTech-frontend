/**
 * Dashboard Page
 * ─────────────────────────────────────────────────────────────
 * Sections:
 *   • Overview  — stats, course progress, recent activity
 *   • Profile   — editable user info, skills, certificates
 *   • My Tests  — filterable test history with review flow
 *   • My Books  — free + purchased books for the logged-in user  ← NEW
 *   • Settings  — notifications, privacy, security, prefs
 ─────────────────────────────────────────────────────────────── */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Overview from "./components/Overview/Overview";
import Profile  from "./components/Profile/Profile";
import MyTest   from "./components/MyTest/MyTest";
import MyBooks  from "./components/MyBooks/MyBooks";   // ← NEW
import Settings from "./components/Settings/Settings";

import { useDashboard, NAV_ITEMS } from "./hooks/useDashboard";
import { getDashboardData, updateProfile, updateSettings } from "@/services/dashboardService";
import styles from "./dashboard.module.css";

const icons = {
  overview: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="2" y="2" width="6" height="6" rx="1.5" />
      <rect x="10" y="2" width="6" height="6" rx="1.5" />
      <rect x="2" y="10" width="6" height="6" rx="1.5" />
      <rect x="10" y="10" width="6" height="6" rx="1.5" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="9" cy="6" r="3" />
      <path d="M2.5 15.5c0-3.314 2.91-6 6.5-6s6.5 2.686 6.5 6" />
    </svg>
  ),
  mytest: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="3" y="2" width="12" height="14" rx="2" />
      <path d="M6 6h6M6 9h6M6 12h4" />
    </svg>
  ),
  // ── My Books icon ──────────────────────────────────────────────────────────
  mybooks: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M3 3h5a2 2 0 0 1 2 2v10a2 2 0 0 0-2-2H3V3z" />
      <path d="M15 3h-5a2 2 0 0 0-2 2v10a2 2 0 0 1 2-2h5V3z" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="9" cy="9" r="2.5" />
      <path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M3.93 3.93l1.06 1.06M13.01 13.01l1.06 1.06M3.93 14.07l1.06-1.06M13.01 4.99l1.06-1.06" />
    </svg>
  ),
  collapse: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M11 4L6 9l5 5" />
    </svg>
  ),
  expand: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M7 4l5 5-5 5" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M9 2a5 5 0 0 1 5 5v3l1.5 2.5H2.5L4 10V7a5 5 0 0 1 5-5z" />
      <path d="M7 15a2 2 0 0 0 4 0" />
    </svg>
  ),
};

const sectionMeta = {
  overview: {
    title:    "Dashboard",
    subtitle: "Track your learning progress and activity.",
  },
  profile: {
    title:    "Profile",
    subtitle: "Manage your personal information and achievements.",
  },
  mytest: {
    title:    "My Tests",
    subtitle: "View assessments, scores, and pending tests.",
  },
  mybooks: {
    title:    "My Books",
    subtitle: "All your free and purchased books in one place.",
  },
  settings: {
    title:    "Settings",
    subtitle: "Update preferences, privacy, and account controls.",
  },
};

const initialDashboardState = {
  user: null,
  overview: { stats: [], progress: [], activity: [] },
  profile: {
    name: "", email: "", bio: "", location: "", website: "", role: "",
    avatarUrl: "", skills: [], certificates: [],
    metrics: { courses: 0, tests: 0, badges: 0 },
  },
  tests: [],
  settings: {
    notifications: {
      emailReminders: false, testAlerts: false, progressReports: false,
      newCourses: false, badges: false,
    },
    privacy:      { publicProfile: false, showProgress: false },
    security:     { twoFactor: false, loginAlerts: false },
    preferences:  { language: "en", timezone: "Asia/Kolkata", dailyGoal: 30, recoveryEmail: "" },
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { activeTab, setActiveTab, collapsed, setCollapsed } = useDashboard();

  const [dashboardData, setDashboardData] = useState(initialDashboardState);
  const [isLoading,     setIsLoading]     = useState(true);
  const [isAuthorized,  setIsAuthorized]  = useState(true);
  const [pageError,     setPageError]     = useState("");

  const loadDashboard = async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const data = await getDashboardData();
      setDashboardData({ ...initialDashboardState, ...data });
      setIsAuthorized(true);
    } catch (error) {
      if (error?.status === 401 || error?.status === 403) {
        setIsAuthorized(false);
        router.replace("/auth");
        return;
      }
      setPageError(error.message || "Failed to load dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const user           = dashboardData.user;
  const currentSection = sectionMeta[activeTab];

  const initials = useMemo(() => {
    const name = user?.name || dashboardData.profile?.name || "";
    if (!name) return "U";
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user, dashboardData.profile]);

  const handleProfileSave = async (nextProfile) => {
    const saved = await updateProfile(nextProfile);
    setDashboardData((prev) => ({
      ...prev,
      user:    { ...prev.user, name: saved.name, email: saved.email, role: saved.role },
      profile: saved,
    }));
  };

  const handleSettingsSave = async (nextSettings) => {
    const saved = await updateSettings(nextSettings);
    setDashboardData((prev) => ({ ...prev, settings: saved }));
  };

  const renderSection = () => {
    switch (activeTab) {
      case "overview":
        return (
          <Overview
            user={user}
            stats={dashboardData.overview.stats}
            progress={dashboardData.overview.progress}
            activity={dashboardData.overview.activity}
            isLoading={isLoading}
          />
        );
      case "profile":
        return (
          <Profile
            user={dashboardData.profile}
            isLoading={isLoading}
            onSave={handleProfileSave}
          />
        );
      case "mytest":
        return <MyTest tests={dashboardData.tests} isLoading={isLoading} />;

      case "mybooks":
        return <MyBooks />;   // ← NEW: self-contained, fetches its own data

      case "settings":
        return (
          <Settings
            data={dashboardData.settings}
            isLoading={isLoading}
            onSave={handleSettingsSave}
          />
        );
      default:
        return null;
    }
  };

  if (!isAuthorized) return null;
  if (isLoading && !dashboardData.user) return null;

  return (
    <div className={styles.dashboardRoot}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
        <div className={styles.sidebarTop}>
          <button
            type="button"
            className={styles.collapseIconBtn}
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className={styles.navIcon}>
              {collapsed ? icons.expand : icons.collapse}
            </span>
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.navItem} ${activeTab === item.id ? styles.active : ""}`}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <span className={styles.navIcon}>{icons[item.icon]}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className={`${styles.main} ${collapsed ? styles.expanded : ""}`}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <h1 className={styles.pageTitle}>{currentSection.title}</h1>
            <p className={styles.pageSubtitle}>{currentSection.subtitle}</p>
          </div>

          <div className={styles.topbarRight}>
            <button type="button" className={styles.iconBtn} aria-label="Notifications">
              {icons.bell}
              <span className={styles.notifDot} />
            </button>

            <div className={styles.avatarPill}>
              <span className={styles.avatarCircle}>{initials}</span>
            </div>
          </div>
        </header>

        <section className={styles.content}>
          {pageError ? (
            <div style={{
              padding: "20px", background: "#fff", borderRadius: "12px",
              border: "1px solid rgba(0,0,0,0.08)",
            }}>
              <p style={{ margin: 0, color: "#b91c1c", fontWeight: 600 }}>{pageError}</p>
              <button
                type="button"
                onClick={loadDashboard}
                style={{
                  marginTop: "12px", height: "40px", padding: "0 16px",
                  border: "none", borderRadius: "10px",
                  background: "#0f1117", color: "#fff", cursor: "pointer",
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            renderSection()
          )}
        </section>
      </main>
    </div>
  );
}