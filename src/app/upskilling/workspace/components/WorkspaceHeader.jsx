import { Menu, ChevronDown, Search, Zap } from "lucide-react";
import styles from "./WorkspaceHeader.module.css";

export default function WorkspaceHeader({ onMenuClick }) {
  return (
    <header className={styles.header}>

      {/* ── Mobile layout ── */}
      <div className={styles.mobileLayout}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={20} strokeWidth={1.8} />
        </button>

        <div className={styles.mobileBrand}>
          <div className={styles.logo}>
            <Zap size={14} />
          </div>
          <div className={styles.mobileTitleWrap}>
            <span className={styles.mobileAppName}>AI Notebook</span>
            <button type="button" className={styles.mobileNotebookName}>
              Untitled notebook
              <ChevronDown size={13} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className={styles.mobileActions}>
          <button className={styles.iconButton} aria-label="Search">
            <Search size={18} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div className={styles.desktopLayout}>
        <div className={styles.left}>
          <div className={styles.logo}>
            <Zap size={15} />
          </div>
          <div className={styles.titleWrap}>
            <h1 className={styles.title}>Untitled notebook</h1>
            <span className={styles.editableHint}>click to rename</span>
          </div>
        </div>

        <div className={styles.right}>
          <button className={styles.primaryButton}>
            <span>New notebook</span>
          </button>
          <button className={styles.ghostButton}>
            <span>Share</span>
          </button>
          <button className={styles.ghostButton}>
            <span>Settings</span>
          </button>
          <div className={styles.divider} />
        </div>
      </div>

    </header>
  );
}