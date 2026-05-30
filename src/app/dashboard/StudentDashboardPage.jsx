"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Overview from "./components/Overview/Overview";
import MyTest   from "./components/MyTest/MyTest";
import MyBooks  from "./components/MyBooks/MyBooks";

import { useDashboard, NAV_ITEMS } from "./hooks/useDashboard";
import { getDashboardData } from "@/services/dashboardService";
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
  mytest: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="3" y="2" width="12" height="14" rx="2" />
      <path d="M6 6h6M6 9h6M6 12h4" />
    </svg>
  ),
  mybooks: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M3 3h5a2 2 0 0 1 2 2v10a2 2 0 0 0-2-2H3V3z" />
      <path d="M15 3h-5a2 2 0 0 0-2 2v10a2 2 0 0 1 2-2h5V3z" />
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
  profile: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="9" cy="6" r="3" />
      <path d="M2.5 15.5c0-3.314 2.91-6 6.5-6s6.5 2.686 6.5 6" />
    </svg>
  ),
};

const sectionMeta = {
  overview: { title: "Dashboard",  subtitle: "Track your learning progress and activity." },
  mytest:   { title: "My Tests",   subtitle: "View assessments, scores, and pending tests." },
  mybooks:  { title: "My Books",   subtitle: "All your free and purchased books in one place." },
};

const initialDashboardState = {
  user: null,
  overview: { stats: [], progress: [], activity: [] },
  tests: [],
};

export default function StudentDashboardPage() {
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
    const name = user?.name || "";
    if (!name) return "U";
    return name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  }, [user]);

  const renderSection = () => {
    switch (activeTab) {
      case "overview": return <Overview user={user} stats={dashboardData.overview.stats} progress={dashboardData.overview.progress} activity={dashboardData.overview.activity} isLoading={isLoading} />;
      case "mytest":   return <MyTest tests={dashboardData.tests} isLoading={isLoading} />;
      case "mybooks":  return <MyBooks />;
      default:         return null;
    }
  };

  if (!isAuthorized) return null;
  if (isLoading && !dashboardData.user) return null;

  return (
    <div className={styles.dashboardRoot}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
        <div className={styles.sidebarTop}>
          <button type="button" className={styles.collapseIconBtn} onClick={() => setCollapsed((prev) => !prev)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <span className={styles.navIcon}>{collapsed ? icons.expand : icons.collapse}</span>
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map((item) => (
            <button key={item.id} type="button" className={`${styles.navItem} ${activeTab === item.id ? styles.active : ""}`} onClick={() => setActiveTab(item.id)} title={collapsed ? item.label : undefined}>
              <span className={styles.navIcon}>{icons[item.icon]}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <button type="button" className={styles.navItem} onClick={() => router.push("/profile")} title={collapsed ? "Profile & Settings" : undefined}>
            <span className={styles.navIcon}>{icons.profile}</span>
            <span className={styles.navLabel}>Profile</span>
          </button>
        </div>
      </aside>

      <main className={`${styles.main} ${collapsed ? styles.expanded : ""}`}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <h1 className={styles.pageTitle}>{currentSection.title}</h1>
            <p className={styles.pageSubtitle}>{currentSection.subtitle}</p>
          </div>
          <div className={styles.topbarRight}>
            <button type="button" className={styles.iconBtn} aria-label="Notifications">{icons.bell}<span className={styles.notifDot} /></button>
            <div className={styles.avatarPill}><span className={styles.avatarCircle}>{initials}</span></div>
          </div>
        </header>
        <section className={styles.content}>
          {pageError ? (
            <div style={{ padding: "20px", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)" }}>
              <p style={{ margin: 0, color: "#b91c1c", fontWeight: 600 }}>{pageError}</p>
              <button type="button" onClick={loadDashboard} style={{ marginTop: "12px", height: "40px", padding: "0 16px", border: "none", borderRadius: "10px", background: "#0f1117", color: "#fff", cursor: "pointer" }}>Retry</button>
            </div>
          ) : renderSection()}
        </section>
      </main>
    </div>
  );
}