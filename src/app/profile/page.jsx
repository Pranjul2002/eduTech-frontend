"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Settings from "@/app/dashboard/components/Settings/Settings";
import { getDashboardData, updateProfile, updateSettings } from "@/services/dashboardService";
import styles from "./profile.module.css";

/* ─── tiny inline icons ─────────────────────────────────────── */
const IconUser    = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6"/></svg>;
const IconMail    = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="4" width="12" height="9" rx="2"/><path d="M2 7l6 4 6-4"/></svg>;
const IconPin     = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="7" r="3"/><path d="M8 2a5 5 0 0 1 5 5c0 3.5-5 9-5 9S3 10.5 3 7a5 5 0 0 1 5-5z"/></svg>;
const IconGlobe   = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M2 8h12M8 2c-1.5 2-2.5 3.8-2.5 6s1 4 2.5 6M8 2c1.5 2 2.5 3.8 2.5 6s-1 4-2.5 6"/></svg>;
const IconEdit    = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z"/></svg>;
const IconCamera  = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 5a1 1 0 0 1 1-1h1.5l1-2h5l1 2H14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5z"/><circle cx="8" cy="9" r="2.5"/></svg>;
const IconBell    = () => <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M9 2a5 5 0 0 1 5 5v3l1.5 2.5H2.5L4 10V7a5 5 0 0 1 5-5z"/><path d="M7 15a2 2 0 0 0 4 0"/></svg>;
const IconGear    = () => <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="9" cy="9" r="2.5"/><path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M3.93 3.93l1.06 1.06M13.01 13.01l1.06 1.06M3.93 14.07l1.06-1.06M13.01 4.99l1.06-1.06"/></svg>;
const IconBack    = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M10 4L6 8l4 4"/></svg>;
const IconPlus    = () => <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M7 2v10M2 7h10"/></svg>;
const IconSkills  = () => <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="2" y="11" width="5" height="5" rx="1"/><path d="M11 4.5h5M11 9h5M11 13.5h5"/></svg>;
const IconCert    = () => <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="3" width="14" height="10" rx="2"/><path d="M6 17l3-2 3 2v-4H6v4z"/></svg>;

/* ─── skill level colours matching existing component ────────── */
const SKILL_COLORS = { beginner: "#e8884a", intermediate: "#9b7efc", advanced: "#3dba74" };

const initialState = {
  user: null,
  profile: {
    name: "", email: "", bio: "", location: "", website: "", role: "", avatarUrl: "",
    skills: [], certificates: [], metrics: { courses: 0, tests: 0, badges: 0 },
  },
  settings: {
    notifications: { emailReminders: false, testAlerts: false, progressReports: false, newCourses: false, badges: false },
    privacy:       { publicProfile: false, showProgress: false },
    security:      { twoFactor: false, loginAlerts: false },
    preferences:   { language: "en", timezone: "Asia/Kolkata", dailyGoal: 30, recoveryEmail: "" },
  },
};

export default function ProfilePage() {
  const router = useRouter();

  const [data,          setData]          = useState(initialState);
  const [isLoading,     setIsLoading]     = useState(true);
  const [isAuthorized,  setIsAuthorized]  = useState(true);
  const [pageError,     setPageError]     = useState("");
  const [settingsOpen,  setSettingsOpen]  = useState(false);

  /* form state for editing */
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({ name: "", email: "", bio: "", location: "", website: "" });

  const loadData = async () => {
    setIsLoading(true);
    setPageError("");
    try {
      const result = await getDashboardData();
      const merged = { ...initialState, ...result };
      setData(merged);
      const p = merged.profile;
      setForm({ name: p.name, email: p.email, bio: p.bio, location: p.location, website: p.website });
    } catch (error) {
      if (error?.status === 401 || error?.status === 403) {
        setIsAuthorized(false);
        router.replace("/auth");
        return;
      }
      setPageError(error.message || "Failed to load profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const initials = useMemo(() => {
    const name = form.name || data.user?.name || "";
    if (!name) return "U";
    return name.split(" ").filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  }, [form.name, data.user]);

  const topbarInitials = useMemo(() => {
    const name = data.user?.name || data.profile?.name || "";
    if (!name) return "U";
    return name.split(" ").filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  }, [data.user, data.profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const saved = await updateProfile({ ...form, role: data.profile?.role });
    setData((prev) => ({
      ...prev,
      user: { ...prev.user, name: saved.name, email: saved.email, role: saved.role },
      profile: saved,
    }));
    setEditing(false);
  };

  const handleSettingsSave = async (nextSettings) => {
    const saved = await updateSettings(nextSettings);
    setData((prev) => ({ ...prev, settings: saved }));
  };

  if (!isAuthorized) return null;
  if (isLoading && !data.user) return null;

  const profile = data.profile;

  return (
    <div className={styles.root}>

      {/* ── Topbar ── */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <button type="button" className={styles.backBtn} onClick={() => router.push("/dashboard")}>
            <IconBack /> Dashboard
          </button>
          <h1 className={styles.pageTitle}>{settingsOpen ? "Settings" : "Profile"}</h1>
        </div>
        <div className={styles.topbarRight}>
          <button
            type="button"
            className={`${styles.iconBtn} ${settingsOpen ? styles.iconBtnActive : ""}`}
            onClick={() => setSettingsOpen((v) => !v)}
            title={settingsOpen ? "Back to Profile" : "Settings"}
            aria-label={settingsOpen ? "Back to Profile" : "Settings"}
          >
            <IconGear />
          </button>
          <button type="button" className={styles.iconBtn} aria-label="Notifications">
            <IconBell />
            <span className={styles.notifDot} />
          </button>
          <div className={styles.avatarPill}>
            <span className={styles.avatarCircle}>{topbarInitials}</span>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <section className={styles.content}>
        {pageError ? (
          <div className={styles.errorBox}>
            <p>{pageError}</p>
            <button type="button" onClick={loadData}>Retry</button>
          </div>
        ) : settingsOpen ? (
          /* ── Settings panel ── */
          <Settings data={data.settings} isLoading={isLoading} onSave={handleSettingsSave} />
        ) : (
          /* ── Profile layout ── */
          <div className={styles.profileWrap}>

            {/* Row 1: avatar card + personal info */}
            <div className={styles.topRow}>

              {/* Dark avatar card */}
              <div className={styles.avatarCard}>
                <div className={styles.avatarBg} />
                <div className={styles.avatarCircleLg}>{initials}</div>
                <p className={styles.avatarName}>{form.name || "User"}</p>
                <p className={styles.avatarRole}>{profile?.role || "—"}</p>

                <div className={styles.statsRow}>
                  <div className={styles.statItem}>
                    <span className={styles.statIcon}>
                      <svg viewBox="0 0 14 14" fill="none" stroke="#e8ff5a" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M2 2h3a1 1 0 0 1 1 1v8a1 1 0 0 0-1-1H2V2z"/>
                        <path d="M12 2H9a1 1 0 0 0-1 1v8a1 1 0 0 1 1-1h3V2z"/>
                      </svg>
                    </span>
                    <span className={styles.statVal}>{profile?.metrics?.courses ?? 0}</span>
                    <span className={styles.statLbl}>Courses</span>
                  </div>
                  <span className={styles.statDiv} />
                  <div className={styles.statItem}>
                    <span className={styles.statIcon}>
                      <svg viewBox="0 0 14 14" fill="none" stroke="#e8ff5a" strokeWidth="1.5" strokeLinecap="round">
                        <rect x="2" y="1" width="10" height="12" rx="1.5"/>
                        <path d="M4 5h6M4 7.5h6M4 10h4"/>
                      </svg>
                    </span>
                    <span className={styles.statVal}>{profile?.metrics?.tests ?? 0}</span>
                    <span className={styles.statLbl}>Tasks</span>
                  </div>
                  <span className={styles.statDiv} />
                  <div className={styles.statItem}>
                    <span className={styles.statIcon}>
                      <svg viewBox="0 0 14 14" fill="none" stroke="#e8ff5a" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M7 1l1.5 3.5L12 5l-2.5 2.5.5 3.5L7 9.5 4 11l.5-3.5L2 5l3.5-.5L7 1z"/>
                      </svg>
                    </span>
                    <span className={styles.statVal}>{profile?.metrics?.badges ?? 0}</span>
                    <span className={styles.statLbl}>Badges</span>
                  </div>
                </div>

                <button type="button" className={styles.changePhotoBtn}>
                  <IconCamera /> Change Photo
                </button>
              </div>

              {/* Personal Information card */}
              <div className={styles.infoCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>Personal Information</span>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => editing ? handleSave() : setEditing(true)}
                  >
                    {editing ? (
                      "Save"
                    ) : (
                      <><IconEdit /> Edit</>
                    )}
                  </button>
                </div>

                <div className={styles.fieldGrid}>
                  <div className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Name</span>
                    <div className={`${styles.fieldBox} ${editing ? styles.fieldBoxActive : ""}`}>
                      <span className={styles.fieldIcon}><IconUser /></span>
                      <input
                        name="name"
                        className={styles.fieldInput}
                        value={form.name}
                        onChange={handleChange}
                        disabled={!editing}
                        placeholder="—"
                      />
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Email</span>
                    <div className={`${styles.fieldBox} ${editing ? styles.fieldBoxActive : ""}`}>
                      <span className={styles.fieldIcon}><IconMail /></span>
                      <input
                        name="email"
                        className={styles.fieldInput}
                        value={form.email}
                        onChange={handleChange}
                        disabled={!editing}
                        placeholder="—"
                      />
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Location</span>
                    <div className={`${styles.fieldBox} ${editing ? styles.fieldBoxActive : ""}`}>
                      <span className={styles.fieldIcon}><IconPin /></span>
                      <input
                        name="location"
                        className={styles.fieldInput}
                        value={form.location}
                        onChange={handleChange}
                        disabled={!editing}
                        placeholder="—"
                      />
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Website</span>
                    <div className={`${styles.fieldBox} ${editing ? styles.fieldBoxActive : ""}`}>
                      <span className={styles.fieldIcon}><IconGlobe /></span>
                      <input
                        name="website"
                        className={styles.fieldInput}
                        value={form.website}
                        onChange={handleChange}
                        disabled={!editing}
                        placeholder="—"
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.fieldGroup} style={{ marginTop: 4 }}>
                  <span className={styles.fieldLabel}>Bio</span>
                  <div className={`${styles.fieldBox} ${styles.fieldBoxTextarea} ${editing ? styles.fieldBoxActive : ""}`}>
                    <textarea
                      name="bio"
                      className={styles.fieldTextarea}
                      value={form.bio}
                      onChange={handleChange}
                      disabled={!editing}
                      rows={4}
                      placeholder="—"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Skills + Certificates */}
            <div className={styles.bottomRow}>

              {/* Skills */}
              <div className={styles.bottomCard}>
                <div className={styles.bottomCardHeader}>
                  <span className={styles.bottomCardIcon} style={{ background: "#e8ff5a22" }}>
                    <IconSkills />
                  </span>
                  <span className={styles.cardTitle}>Skills</span>
                </div>
                <p className={styles.bottomCardDesc}>
                  Showcase your expertise and<br />let others know what you do best.
                </p>

                {profile?.skills?.length > 0 && (
                  <div className={styles.skillsWrap}>
                    {profile.skills.map((s) => {
                      const color = SKILL_COLORS[s.level] || "#94a3b8";
                      return (
                        <span
                          key={`${s.label}-${s.level}`}
                          className={styles.skillTag}
                          style={{ background: `${color}15`, color, borderColor: `${color}30` }}
                        >
                          {s.label}
                        </span>
                      );
                    })}
                  </div>
                )}

                <button type="button" className={styles.addBtn}>
                  <IconPlus /> Add Skill
                </button>

                {/* decorative illustration */}
                <div className={styles.skillIllustration} aria-hidden>
                  <svg viewBox="0 0 80 80" fill="none">
                    <rect x="10" y="40" width="60" height="30" rx="4" stroke="#e0dfdb" strokeWidth="1.5"/>
                    <path d="M25 40V30a15 15 0 0 1 30 0v10" stroke="#e0dfdb" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M30 55l5 5 15-15" stroke="#e8ff5a" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>

              {/* Certificates */}
              <div className={styles.bottomCard}>
                <div className={styles.bottomCardHeader}>
                  <span className={styles.bottomCardIcon} style={{ background: "#e8ff5a22" }}>
                    <IconCert />
                  </span>
                  <span className={styles.cardTitle}>Certificates</span>
                </div>
                <p className={styles.bottomCardDesc}>
                  Display your achievements<br />and certifications.
                </p>

                <button type="button" className={styles.addBtn}>
                  <IconPlus /> Add Certificate
                </button>

                {profile?.certificates?.length > 0 ? (
                  <div className={styles.certList}>
                    {profile.certificates.map((cert, i) => (
                      <div key={`${cert.title}-${i}`} className={styles.certItem}>
                        <span className={styles.certEmoji}>{cert.icon || "🏅"}</span>
                        <div className={styles.certBody}>
                          <span className={styles.certTitle}>{cert.title}</span>
                          <span className={styles.certSub}>{cert.issuer}{cert.date ? ` · ${cert.date}` : ""}</span>
                        </div>
                        <button type="button" className={styles.certViewBtn}>View</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.certEmpty}>
                    <span className={styles.certEmptyIcon}>
                      <svg viewBox="0 0 20 20" fill="none" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round">
                        <rect x="2" y="3" width="16" height="11" rx="2"/>
                        <path d="M7 18l3-2 3 2v-4H7v4z"/>
                      </svg>
                    </span>
                    No certificates available yet.<br/>
                    <span style={{ color: "#bbb" }}>Add your first certificate to get started.</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </section>
    </div>
  );
}