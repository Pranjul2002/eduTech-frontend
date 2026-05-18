"use client";

import {
  Plus,
  Search,
  Globe,
  ChevronDown,
  ArrowRight,
  FileText,
  PanelLeftClose,
  Trash2,
} from "lucide-react";
import styles from "./SourcesPanel.module.css";
import { useFiles } from "../../context/FileContext";

function formatFileSize(size) {
  if (!size) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export default function SourcesPanel({ onUploadClick, onClose }) {
  const { sources, activeSourceId, setActiveSourceId, removeFile } = useFiles();

  return (
    <aside className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Sources</h2>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Hide sources panel"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      <button className={styles.addButton} onClick={onUploadClick}>
        <Plus size={16} />
        <span>Add sources</span>
      </button>

      {sources.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FileText size={22} />
          </div>
          <h3 className={styles.emptyTitle}>No sources yet</h3>
          <p className={styles.emptyText}>Upload a file to see it here.</p>
        </div>
      ) : (
        <div className={styles.sourceList}>
          {sources.map((source) => (
            <div
              key={source.localId}
              role="button"
              tabIndex={0}
              className={`${styles.sourceCard} ${
                activeSourceId === source.localId ? styles.sourceCardActive : ""
              }`}
              onClick={() => setActiveSourceId(source.localId)}
              onKeyDown={(e) => e.key === "Enter" && setActiveSourceId(source.localId)}
            >
              <div className={styles.sourceTopRow}>
                <div className={styles.sourceIconWrap}>
                  <FileText size={18} />
                </div>
                <div className={styles.sourceMeta}>
                  <div className={styles.sourceName}>{source.name}</div>
                  <div className={styles.sourceSubMeta}>
                    <span>{formatFileSize(source.size)}</span>
                    <span className={styles.dot} />
                    <span className={`${styles.statusPill} ${styles[`status_${source.status}`]}`}>
                      {source.status}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeFile(source.localId);
                  }}
                  aria-label={`Remove ${source.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {typeof source.progress === "number" && source.status !== "ready" ? (
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${Math.max(8, source.progress)}%` }}
                  />
                </div>
              ) : null}

              {source.summary ? (
                <p className={styles.summary}>{source.summary}</p>
              ) : source.error ? (
                <p className={styles.errorText}>{source.error}</p>
              ) : (
                <p className={styles.summaryMuted}>
                  {source.status === "ready"
                    ? "Ready for source-grounded chat."
                    : "Waiting for summary from backend."}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className={styles.searchCard}>
        <div className={styles.inputRow}>
          <Search size={18} className={styles.inputIcon} />
          <input
            type="text"
            placeholder="Search the web for new sources"
            className={styles.input}
          />
        </div>

        <div className={styles.searchFooter}>
          <div className={styles.chips}>
            <button className={styles.chip} type="button">
              <Globe size={15} />
              <span>Web</span>
              <ChevronDown size={14} />
            </button>

            <button className={styles.chip} type="button">
              <Search size={15} />
              <span>Fast Research</span>
              <ChevronDown size={14} />
            </button>
          </div>

          <button className={styles.arrowButton} aria-label="Search" type="button">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}