"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import MentorOverview from "./components/MentorOverview/MentorOverview";
import CreateTest     from "./components/CreateTest/CreateTest";
import MentorTests    from "./components/MentorTests/MentorTests";

import { getDashboardData } from "@/services/dashboardService";
import styles from "../dashboard/dashboard.module.css";

const icons = {
  overview: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="2" y="2" width="6" height="6" rx="1.5" />
      <rect x="10" y="2" width="6" height="6" rx="1.5" />
      <rect x="2" y="10" width="6" height="6" rx="1.5" />
      <rect x="10" y="10" width="6" height="6" rx="1.5" />
    </svg>
  ),
  createtest: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="3" y="2" width="12" height="14" rx="2" />
      <path d="M9 6v6M6 9h6" />
    </svg>
  ),
  mytests: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="3" y="2" width="12" height="14" rx="2" />
      <path d="M6 6h6M6 9h6M6 12h4" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="9" cy="6" r="3" />
      <path d="M2.5 15.5c0-3.314 2.91-6 6.5-6s6.5 2.686 6.5 6" />
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

const NAV_ITEMS = [
  { id: "overview",   label: "Overview",    icon: "overview"   },
  { id: "createtest", label: "Create Test", icon: "createtest" },
  { id: "mytests",    label: "My Tests",    icon: "mytests"    },
];

const sectionMeta = {
  overview:   { title: "Mentor Dashboard", subtitle: "Manage your tests and track your content." },
  createtest: { title: "Create Test",      subtitle: "Add a new test associated with a subject, exam, or both." },
  mytests:    { title: "My Tests",         subtitle: "All tests you've created on the platform." },
};

const initialState = {
  user: null,
};

export default function MentorDashboardPage() {
  const router = useRouter();

  const [activeTab,   setActiveTab]   = useState("overview");
  const [collapsed,   setCollapsed]   = useState(false);
  const [data,        setData]        = useState(initialState);
  const [isLoading,   setIsLoading]   = useState(true);
  const [pageError,   setPageError]   = useState("");
  const [testRefresh, setTestRefresh] = useState(0);
  const [testCount,   setTestCount]   = useState(0);

  const loadDashboard = async () => {
    setIsLoading(true);
    setPageError("");
    try {
      const d = await getDashboardData();
      setData({ ...initialState, ...d });
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) { router.replace("/auth"); return; }
      setPageError(err.message || "Failed to load dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const user           = data.user;
  const currentSection = sectionMeta[activeTab];

  const initials = useMemo(() => {
    const name = user?.name || "";
    if (!name) return "M";
    return name.split(" ").filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  }, [user]);

  const handleTestCreated = () => {
    setTestRefresh((n) => n + 1);
    setTestCount((n) => n + 1);
    setTimeout(() => setActiveTab("mytests"), 800);
  };

  const renderSection = () => {
    switch (activeTab) {
      case "overview":   return <MentorOverview user={user} testCount={testCount} isLoading={isLoading} />;
      case "createtest": return <CreateTest onCreated={handleTestCreated} />;
      case "mytests":    return <MentorTests refreshTrigger={testRefresh} />;
      default:           return null;
    }
  };

  return (
    <div className={styles.dashboardRoot}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
        <div className={styles.sidebarTop}>
          <button type="button" className={styles.collapseIconBtn} onClick={() => setCollapsed((p) => !p)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
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