"use client";

import { useState } from "react";
import { createTest } from "@/services/mentorService";
import styles from "./CreateTest.module.css";

const EXAM_OPTIONS = ["JEE", "NEET", "GATE", "UPSC", "CAT", "CUET", "NDA", "Other"];

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="4 10 8 14 16 6" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="10" y1="4" x2="10" y2="16" />
    <line x1="4" y1="10" x2="16" y2="10" />
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const ClipboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function CreateTest({ onCreated }) {
  const [form, setForm] = useState({
    title: "", subjectName: "", examName: "", customExam: "", isPaid: false, price: "",
  });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(null);
  const [apiError, setApiError] = useState("");

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "", association: "" }));
    setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Test name is required.";
    if (!form.subjectName.trim() && !form.examName.trim() && !form.customExam.trim())
      errs.association = "Associate the test with at least a Subject or an Exam.";
    if (form.isPaid) {
      const p = parseFloat(form.price);
      if (!form.price || isNaN(p) || p <= 0) errs.price = "Enter a valid price greater than 0.";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError("");
    setSuccess(null);

    try {
      const finalExam = form.customExam.trim() || form.examName.trim();
      const payload = {
        title:       form.title.trim(),
        isPaid:      form.isPaid,
        price:       form.isPaid ? parseFloat(form.price) : undefined,
        subjectName: form.subjectName.trim() || undefined,
        examName:    finalExam || undefined,
      };
      const created = await createTest(payload);
      setSuccess(created);
      setForm({ title: "", subjectName: "", examName: "", customExam: "", isPaid: false, price: "" });
      if (onCreated) onCreated(created);
    } catch (err) {
      setApiError(err.message || "Failed to create test. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.root}>

      {/* ── Success banner ── */}
      {success && (
        <div className={styles.successBanner}>
          <span className={styles.successIconWrap}><CheckIcon /></span>
          <span>
            <strong>"{success.title}"</strong> created successfully!
            {success.subjectName && <> · Subject: <strong>{success.subjectName}</strong></>}
            {success.examName    && <> · Exam: <strong>{success.examName}</strong></>}
          </span>
        </div>
      )}

      {/* ── Form card ── */}
      <form onSubmit={handleSubmit} className={styles.card} noValidate>

        {/* Section 1 — Test Details */}
        <div className={styles.section}>
          <div className={styles.sectionMeta}>
            <span className={styles.stepBadge}>1</span>
            <div>
              <p className={styles.sectionTitle}>Test Details</p>
              <p className={styles.sectionDesc}>Provide basic information about your test.</p>
            </div>
          </div>

          <div className={styles.fields}>
            {/* Test Name */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="ct-title">
                Test Name <span className={styles.req}>*</span>
              </label>
              <input
                id="ct-title"
                className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
                type="text"
                placeholder="e.g. JEE Physics – Mechanics Mock 1"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                disabled={loading}
                maxLength={120}
              />
              {errors.title
                ? <p className={styles.errMsg}>{errors.title}</p>
                : <p className={styles.hint}>Test name will be visible to all users on the platform.</p>
              }
            </div>

            {/* Subject / OR / Exam */}
            <div className={styles.assocRow}>
              <div className={styles.fieldGroup} style={{ flex: 1 }}>
                <label className={styles.label} htmlFor="ct-subject">Subject</label>
                <div className={styles.inputWithIcon}>
                  <span className={styles.inputIconLeft}><BookIcon /></span>
                  <input
                    id="ct-subject"
                    className={`${styles.input} ${styles.inputIndented} ${errors.association ? styles.inputError : ""}`}
                    type="text"
                    placeholder="e.g. Physics, Chemistry"
                    value={form.subjectName}
                    onChange={(e) => set("subjectName", e.target.value)}
                    disabled={loading}
                    maxLength={80}
                  />
                </div>
              </div>

              <div className={styles.orDivider}>OR</div>

              <div className={styles.fieldGroup} style={{ flex: 1 }}>
                <label className={styles.label} htmlFor="ct-exam">Exam</label>
                <select
                  id="ct-exam"
                  className={`${styles.input} ${styles.select} ${errors.association ? styles.inputError : ""}`}
                  value={form.examName}
                  onChange={(e) => set("examName", e.target.value)}
                  disabled={loading}
                >
                  <option value="">— Select exam —</option>
                  {EXAM_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className={styles.inputWithIcon} style={{ marginTop: 8 }}>
                  <span className={styles.inputIconLeft}><ClipboardIcon /></span>
                  <input
                    className={`${styles.input} ${styles.inputIndented}`}
                    type="text"
                    placeholder="Or type custom exam"
                    value={form.customExam}
                    onChange={(e) => set("customExam", e.target.value)}
                    disabled={loading}
                    maxLength={60}
                  />
                </div>
              </div>
            </div>

            {errors.association && <p className={styles.errMsg}>{errors.association}</p>}
          </div>
        </div>

        <div className={styles.divider} />

        {/* Section 2 — Pricing */}
        <div className={styles.section}>
          <div className={styles.sectionMeta}>
            <span className={styles.stepBadge}>2</span>
            <div>
              <p className={styles.sectionTitle}>Pricing</p>
              <p className={styles.sectionDesc}>Choose how you want to offer this test.</p>
            </div>
          </div>

          <div className={styles.pricingCards}>
            {/* Free */}
            <button
              type="button"
              className={`${styles.pricingCard} ${!form.isPaid ? styles.pricingCardActive : ""}`}
              onClick={() => { set("isPaid", false); set("price", ""); }}
              disabled={loading}
            >
              <div className={styles.pricingCardLeft}>
                <span className={`${styles.radioCircle} ${!form.isPaid ? styles.radioCircleActive : ""}`} />
                <div>
                  <p className={styles.pricingTitle}>Free</p>
                  <p className={styles.pricingDesc}>Users can access this test for free.</p>
                </div>
              </div>
              {!form.isPaid && (
                <span className={styles.pricingCheck}><CheckIcon /></span>
              )}
            </button>

            {/* Paid */}
            <button
              type="button"
              className={`${styles.pricingCard} ${form.isPaid ? styles.pricingCardActive : ""}`}
              onClick={() => set("isPaid", true)}
              disabled={loading}
            >
              <div className={styles.pricingCardLeft}>
                <span className={styles.lockWrap}><LockIcon /></span>
                <div>
                  <p className={styles.pricingTitle}>Paid</p>
                  <p className={styles.pricingDesc}>Set a price for this test.</p>
                </div>
              </div>
              {form.isPaid && (
                <span className={styles.pricingCheck}><CheckIcon /></span>
              )}
            </button>
          </div>

          {/* Price input */}
          {form.isPaid && (
            <div className={styles.fieldGroup} style={{ maxWidth: 220, marginTop: 16 }}>
              <label className={styles.label} htmlFor="ct-price">
                Price (₹) <span className={styles.req}>*</span>
              </label>
              <div className={styles.priceWrap}>
                <span className={styles.currencySymbol}>₹</span>
                <input
                  id="ct-price"
                  className={`${styles.input} ${styles.priceInput} ${errors.price ? styles.inputError : ""}`}
                  type="number" min="1" step="1" placeholder="299"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  disabled={loading}
                />
              </div>
              {errors.price && <p className={styles.errMsg}>{errors.price}</p>}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className={styles.footer}>
          {apiError && <p className={styles.apiError}>{apiError}</p>}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading
              ? <span className={styles.spinner} />
              : <><span className={styles.plusIconWrap}><PlusIcon /></span> Create Test</>
            }
          </button>
        </div>

      </form>
    </div>
  );
}