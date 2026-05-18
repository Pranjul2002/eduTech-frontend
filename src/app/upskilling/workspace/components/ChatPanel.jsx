"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Upload, ArrowUp, FileText, Sparkles, Paperclip, ChevronRight } from "lucide-react";
import styles from "./ChatPanel.module.css";
import { useFiles } from "../../context/FileContext";

const QUICK_ACTIONS = [
  { id: "summarize",  label: "Summarize the resume",  icon: FileText   },
  { id: "skills",     label: "Extract key skills",    icon: Sparkles   },
  { id: "work",       label: "Work experience",       icon: FileText   },
  { id: "education",  label: "Education details",     icon: FileText   },
];

export default function ChatPanel({ onUploadClick }) {
  const { sources, activeSource, askQuestion } = useFiles();
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const sourceCount = sources.length;
  const messages = activeSource?.messages || [];
  const isReady = activeSource?.status === "ready";
  const hasMessages = messages.length > 0;

  useEffect(() => {
    const container = messagesEndRef.current?.parentElement;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, isSubmitting]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [question]);

  const helperText = useMemo(() => {
    if (!activeSource) return "Upload a source to get started";
    if (activeSource.status === "uploading") return "Uploading source...";
    if (activeSource.status === "processing") return "Analyzing your document...";
    if (activeSource.status === "failed") return activeSource.error || "Source processing failed";
    return `Ask anything about ${activeSource.name}`;
  }, [activeSource]);

  const handleSubmit = async (event) => {
    event?.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || !activeSource || !isReady || isSubmitting) return;
    setIsSubmitting(true);
    setQuestion("");
    try {
      await askQuestion(activeSource.localId, trimmedQuestion);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleQuickAction = (label) => {
    if (!isReady || isSubmitting) return;
    setQuestion(label);
    setTimeout(() => {
      const ta = textareaRef.current;
      if (ta) { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; }
    }, 0);
  };

  return (
    <section className={styles.panel}>

      {/* ── Desktop header ── */}
      <div className={styles.desktopHeader}>
        <div className={styles.headerLeft}>
          <Sparkles size={15} className={styles.sparkIcon} />
          <h2 className={styles.title}>AI Chat</h2>
        </div>
        {activeSource ? (
          <div className={styles.scopeBadge}>
            <FileText size={12} />
            <span>{activeSource.name}</span>
          </div>
        ) : null}
      </div>

      {/* ── Current source strip (mobile only) ── */}
      {activeSource && (
        <div className={styles.sourceStrip}>
          <span className={styles.sourceStripLabel}>Current source</span>
          <ChevronRight size={14} className={styles.sourceStripChevron} />
          <div className={styles.sourceStripFile}>
            <div className={styles.sourceStripIcon}>
              <FileText size={16} />
            </div>
            <div className={styles.sourceStripMeta}>
              <span className={styles.sourceStripName}>{activeSource.name}</span>
              <div className={styles.sourceStripSub}>
                <span>{activeSource.type?.toUpperCase().split("/").pop() || "FILE"}</span>
                <span className={styles.dot} />
                <span>{formatSize(activeSource.size)}</span>
                {activeSource.uploadedAt && (
                  <>
                    <span className={styles.dot} />
                    <span>{formatDate(activeSource.uploadedAt)}</span>
                  </>
                )}
              </div>
            </div>
            {activeSource.status === "ready" && (
              <span className={styles.readyPill}>Ready</span>
            )}
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className={styles.body}>
        {!activeSource ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><Upload size={20} /></div>
            <h3 className={styles.emptyTitle}>No source selected</h3>
            <p className={styles.emptyDesc}>Upload a PDF or text file to start chatting with your document.</p>
            <button className={styles.uploadButton} onClick={onUploadClick}>Upload a source</button>
          </div>
        ) : !hasMessages ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Sparkles size={22} />
            </div>
            <h3 className={styles.emptyTitle}>{isReady ? "Ready to answer" : "Preparing…"}</h3>
            <p className={styles.emptyDesc}>{activeSource.summary || helperText}</p>
          </div>
        ) : (
          <div className={styles.messages}>
            <div className={styles.messagesInner}>
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`${styles.message} ${
                    message.role === "user" ? styles.userMessage : styles.assistantMessage
                  } ${message.isError ? styles.errorMessage : ""}`}
                >
                  <div className={styles.messageRole}>
                    {message.role === "user" ? "You" : "AI"}
                  </div>
                  <p className={styles.messageText}>{message.content}</p>
                  {Array.isArray(message.citations) && message.citations.length > 0 ? (
                    <div className={styles.citations}>
                      {message.citations.map((citation, index) => (
                        <div key={`${message.id}_${index}`} className={styles.citationItem}>
                          <div className={styles.citationLabel}>
                            {citation.page ? `Page ${citation.page}` : "Source excerpt"}
                          </div>
                          <p className={styles.citationText}>{citation.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
              {isSubmitting && (
                <article className={`${styles.message} ${styles.assistantMessage}`}>
                  <div className={styles.messageRole}>AI</div>
                  <div className={styles.typingDots}>
                    <span /><span /><span />
                  </div>
                </article>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Quick action chips (mobile, shown when ready and no messages) ── */}
      {isReady && !hasMessages && (
        <div className={styles.quickActions}>
          {QUICK_ACTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={styles.quickChip}
              onClick={() => handleQuickAction(label)}
            >
              <FileText size={13} className={styles.quickChipIcon} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Input bar ── */}
      <form className={styles.inputBar} onSubmit={handleSubmit}>
        <button
          type="button"
          className={styles.attachButton}
          onClick={onUploadClick}
          aria-label="Attach file"
        >
          <Paperclip size={17} strokeWidth={1.8} />
        </button>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder={helperText}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isReady || isSubmitting}
          rows={1}
        />
        <button
          className={styles.sendButton}
          aria-label="Send"
          type="submit"
          disabled={!isReady || isSubmitting || !question.trim()}
        >
          <ArrowUp size={16} strokeWidth={2.5} />
        </button>
      </form>

      <p className={styles.footerText}>
        Answers are grounded in your uploaded document. Always verify important information.
      </p>

    </section>
  );
}

function formatSize(size) {
  if (!size) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) { value /= 1024; i++; }
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}