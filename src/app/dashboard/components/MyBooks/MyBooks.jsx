"use client";

import { useEffect, useState } from "react";
import styles from "./MyBooks.module.css";
import { getMyBooks } from "@/services/dashboardService";

// ── Subject theme (border accent + badge colours) ─────────────────────────────
const subjectTheme = {
  Physics:     { accent: "#4f8ef7", badgeBg: "#eef3ff", badgeColor: "#4f8ef7" },
  Chemistry:   { accent: "#f7a24f", badgeBg: "#fff5eb", badgeColor: "#f7a24f" },
  Mathematics: { accent: "#3dba74", badgeBg: "#edfff5", badgeColor: "#3dba74" },
  Biology:     { accent: "#a04ff7", badgeBg: "#f5eeff", badgeColor: "#a04ff7" },
};

const FILTERS = [
  { id: "all",  label: "All Books"  },
  { id: "free", label: "Free Books" },
];

// ── Summary stat card ─────────────────────────────────────────────────────────
const StatCard = ({ icon, value, label }) => (
  <div className={styles.statCard}>
    <div className={styles.statIconWrap}>{icon}</div>
    <div className={styles.statText}>
      <span className={styles.statVal}>{value}</span>
      <span className={styles.statLbl}>{label}</span>
    </div>
  </div>
);

// ── Book card matching the design ─────────────────────────────────────────────
const BookCard = ({ book }) => {
  const theme = subjectTheme[book.subject] || { accent: "#888", badgeBg: "#f3f3f0", badgeColor: "#888" };

  const handleOpen = () => {
    window.location.href = `/products/books/${book.classSlug}/${book.slug}`;
  };

  return (
    <div className={styles.bookCard} style={{ "--accent": theme.accent }}>
      {/* Coloured left border accent */}
      <div className={styles.bookAccentBar} style={{ background: theme.accent }} />

      <div className={styles.bookInner}>
        {/* Subject badge */}
        <span
          className={styles.subjectBadge}
          style={{ background: theme.badgeBg, color: theme.badgeColor }}
        >
          {book.subject?.toUpperCase()}
        </span>

        {/* Title */}
        <h3 className={styles.bookTitle}>{book.title}</h3>

        {/* Class label */}
        <p className={styles.classLabel}>{book.classLabel}</p>

        <div className={styles.bookDivider} />

        {/* Chapter count */}
        <div className={styles.chapterRow}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <span>{book.chapterCount} chapters</span>
        </div>

        {/* Open button */}
        <button
          type="button"
          className={styles.openBtn}
          style={{ color: theme.accent, borderColor: theme.accent, "--btn-bg": theme.badgeBg }}
          onClick={handleOpen}
        >
          Open Book
        </button>
      </div>
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className={`${styles.bookCard} ${styles.skeletonCard}`}>
    <div className={styles.bookAccentBar} style={{ background: "#e5e7eb" }} />
    <div className={styles.bookInner}>
      <div className={`${styles.skeletonLine} ${styles.skeletonShort}`} />
      <div className={`${styles.skeletonLine} ${styles.skeletonMed}`}   />
      <div className={`${styles.skeletonLine} ${styles.skeletonLong}`}  />
      <div className={`${styles.skeletonLine} ${styles.skeletonShort}`} style={{ marginTop: 12 }} />
      <div className={`${styles.skeletonBtn}`} />
    </div>
  </div>
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ filter }) => (
  <div className={styles.emptyState}>
    <span className={styles.emptyIcon}>📚</span>
    <p className={styles.emptyTitle}>
      {filter === "free" ? "No free books found." : "No books yet."}
    </p>
    <p className={styles.emptyHint}>
      {filter === "free"
        ? "Free NCERT books should appear here automatically."
        : "Browse our catalogue and purchase a book to see it here."}
    </p>
  </div>
);

// ── Search input ──────────────────────────────────────────────────────────────
const SearchInput = ({ value, onChange }) => (
  <div className={styles.searchWrap}>
    <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <input
      className={styles.searchInput}
      type="text"
      placeholder="Search books..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function MyBooks() {
  const [filter,    setFilter]    = useState("all");
  const [search,    setSearch]    = useState("");
  const [books,     setBooks]     = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getMyBooks();
        setBooks(data);
      } catch (err) {
        setError(err.message || "Failed to load books.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const freeCount = books.filter((b) => b.isFree).length;
  const paidCount = books.filter((b) => !b.isFree).length;

  const displayed = books
    .filter((b) => filter === "free" ? b.isFree : true)
    .filter((b) => !search.trim() || b.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.root}>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className={styles.statsRow}>
        <StatCard
          value={isLoading ? "—" : books.length}
          label="Total Books"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f8ef7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          }
        />
        <StatCard
          value={isLoading ? "—" : freeCount}
          label="Free Books"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3dba74" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 12 20 22 4 22 4 12"/>
              <rect x="2" y="7" width="20" height="5"/>
              <line x1="12" y1="22" x2="12" y2="7"/>
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
            </svg>
          }
        />
        <StatCard
          value={isLoading ? "—" : paidCount}
          label="Purchased"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a04ff7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          }
        />
      </div>

      {/* ── Library panel ───────────────────────────────────────────────── */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Your Library</span>
          <div className={styles.panelControls}>
            <SearchInput value={search} onChange={setSearch} />
            <div className={styles.filterRow}>
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`${styles.filterTab} ${filter === f.id ? styles.activeTab : ""}`}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.panelBody}>
          {error && <p className={styles.errorMsg}>{error}</p>}

          {isLoading ? (
            <div className={styles.grid}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : displayed.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <div className={styles.grid}>
              {displayed.map((book) => (
                <BookCard key={book.slug} book={book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}