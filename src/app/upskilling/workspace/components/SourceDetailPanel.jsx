"use client";

import { FileText, Info, Eye, Download, StickyNote, MessageSquare } from "lucide-react";
import styles from "./SourceDetailPanel.module.css";
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

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function inferTags(source) {
  if (!source) return [];
  const tags = [];
  const name = (source.name || "").toLowerCase();
  const summary = (source.summary || "").toLowerCase();
  const combined = name + " " + summary;

  if (combined.includes("resume") || combined.includes("cv")) tags.push("Resume");
  if (
    combined.includes("python") ||
    combined.includes("java") ||
    combined.includes("html") ||
    combined.includes("code")
  )
    tags.push("Code");
  if (
    combined.includes("machine learning") ||
    combined.includes("ai") ||
    combined.includes("ml")
  )
    tags.push("AI/ML");
  if (
    combined.includes("full stack") ||
    combined.includes("fullstack") ||
    combined.includes("web")
  )
    tags.push("Full Stack");
  if (combined.includes("project")) tags.push("Projects");
  if (combined.includes("science") || combined.includes("research")) tags.push("Research");
  if (tags.length === 0) tags.push("Document");
  return tags;
}

export default function SourceDetailPanel() {
  const { activeSource } = useFiles();

  if (!activeSource) {
    return (
      <aside className={styles.panel}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Info size={20} />
          </div>
          <p className={styles.emptyText}>Select a source to see details</p>
        </div>
      </aside>
    );
  }

  const tags = inferTags(activeSource);
  const wordCount = activeSource.wordCount || "—";
  const pageCount = activeSource.pageCount || "—";

  return (
    <aside className={styles.panel}>
      {/* Header label */}
      <div className={styles.sectionLabel}>
        <Info size={13} />
        <span>About this source</span>
      </div>

      {/* Source identity card */}
      <div className={styles.sourceCard}>
        <div className={styles.sourceIconWrap}>
          <FileText size={18} />
        </div>
        <div className={styles.sourceMeta}>
          <div className={styles.sourceName}>{activeSource.name}</div>
          <div className={styles.sourceSubMeta}>
            <span className={styles.fileType}>
              {activeSource.type?.includes("pdf")
                ? "PDF"
                : activeSource.name?.split(".").pop()?.toUpperCase() || "FILE"}
            </span>
            <span className={styles.dot} />
            <span>{formatFileSize(activeSource.size)}</span>
          </div>
        </div>
        <span className={`${styles.statusPill} ${styles[`status_${activeSource.status}`]}`}>
          {activeSource.status}
        </span>
      </div>

      {/* Overview */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Overview</div>
        <div className={styles.metaRow}>
          <span className={styles.metaKey}>Pages</span>
          <span className={styles.metaValue}>{pageCount}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaKey}>Words</span>
          <span className={styles.metaValue}>{wordCount}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaKey}>Uploaded</span>
          <span className={styles.metaValue}>{formatDate(activeSource.uploadedAt)}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaKey}>Language</span>
          <span className={styles.metaValue}>English</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Quick Actions</div>
        <div className={styles.actionList}>
          <button className={styles.actionItem} type="button">
            <Eye size={15} className={styles.actionIcon} />
            <span>View full document</span>
          </button>
          <button className={styles.actionItem} type="button">
            <Download size={15} className={styles.actionIcon} />
            <span>Download</span>
          </button>
          <button className={styles.actionItem} type="button">
            <StickyNote size={15} className={styles.actionIcon} />
            <span>Add notes</span>
          </button>
          <button className={styles.actionItem} type="button">
            <MessageSquare size={15} className={styles.actionIcon} />
            <span>Ask about this source</span>
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Tags</div>
        <div className={styles.tagList}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}