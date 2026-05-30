"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Settings from "../components/Settings/Settings";
import { getDashboardData, updateSettings } from "@/services/dashboardService";
import styles from "../dashboard.module.css";

const icons = {
  bell: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M9 2a5 5 0 0 1 5 5v3l1.5 2.5H2.5L4 10V7a5 5 0 0 1 5-5z" />
      <path d="M7 15a2 2 0 0 0 4 0" />
    </svg>
  ),
  back: (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M11 4L6 9l5 5" />
    </svg>
  ),
};

const initialSettingsState = {
  user: null,
  settings: {
    notifications: { emailReminders: false, testAlerts: false, progressReports: false, newCourses: false, badges: false },
    privacy:       { publicProfile: false, showProgress: false },
    security:      { twoFactor: false, loginAlerts: false },
    preferences:   { language: "en", timezone: "Asia/Kolkata", dailyGoal: 30, recoveryEmail: "" },
  },
};

export default function SettingsPage() {
  const router = useRouter();

  const [data,        setData]        = useState(initialSettingsState);
  const [isLoading,   setIsLoading]   = useState(true);
  const [isAuthorized,setIsAuthorized]= useState(true);
  const [pageError,   setPageError]   = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setPageError("");
    try {
      const result = await getDashboardData();
      setData({ ...initialSettingsState, ...result });
      setIsAuthorized(true);
    } catch (error) {
      if (error?.status === 401 || error?.status === 403) {
        setIsAuthorized(false);
        router.replace("/auth");
        return;
      }
      setPageError(error.message || "Failed to load settings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const initials = useMemo(() => {
    const name = data.user?.name || "";
    if (!name) return "U";
    return name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  }, [data.user]);

  const handleSettingsSave = async (nextSettings) => {
    const saved = await updateSettings(nextSettings);
    setData((prev) => ({ ...prev, settings: saved }));
  };

  if (!isAuthorized) return null;
  if (isLoading && !data.user) return null;

  return (
    <div className={styles.dashboardRoot}>
      <main className={styles.main} style={{ width: "100%" }}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <h1 className={styles.pageTitle}>Settings</h1>
            <p className={styles.pageSubtitle}>Update preferences, privacy, and account controls.</p>
          </div>
          <div className={styles.topbarRight}>
            <button type="button" className={styles.iconBtn} aria-label="Notifications">
              {icons.bell}<span className={styles.notifDot} />
            </button>
            <div className={styles.avatarPill}>
              <span className={styles.avatarCircle}>{initials}</span>
            </div>
          </div>
        </header>

        <section className={styles.content}>
          <button type="button" className={styles.backBtn} onClick={() => router.push("/dashboard")}>
            {icons.back} Back to Dashboard
          </button>

          {pageError ? (
            <div style={{ padding: "20px", background: "#fff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)" }}>
              <p style={{ margin: 0, color: "#b91c1c", fontWeight: 600 }}>{pageError}</p>
              <button type="button" onClick={loadData} style={{ marginTop: "12px", height: "40px", padding: "0 16px", border: "none", borderRadius: "10px", background: "#0f1117", color: "#fff", cursor: "pointer" }}>Retry</button>
            </div>
          ) : (
            <Settings data={data.settings} isLoading={isLoading} onSave={handleSettingsSave} />
          )}
        </section>
      </main>
    </div>
  );
}