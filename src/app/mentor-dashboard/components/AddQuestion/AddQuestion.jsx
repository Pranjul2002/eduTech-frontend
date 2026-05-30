"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getTestQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  publishTest,
  deleteTest,
} from "@/services/mentorService";
import styles from "./AddQuestion.module.css";

// ── Icons ────────────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="5" y1="5" x2="15" y2="15" /><line x1="15" y1="5" x2="5" y2="15" />
  </svg>
);
const EditIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M14.7 3.3a1 1 0 0 1 2 2L6 16l-3 1 1-3 10.7-10.7z" />
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M4 6h12M8 6V4h4v2M6 6l1 10h6l1-10" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="10" y1="4" x2="10" y2="16" /><line x1="4" y1="10" x2="16" y2="10" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <polyline points="4 10 8 14 16 6" />
  </svg>
);

// ── Constants ────────────────────────────────────────────────────────────────

const OPTION_LABELS = ["A", "B", "C", "D"];

const emptyForm = () => ({
  questionText: "",
  optionA: "", optionB: "", optionC: "", optionD: "",
  correctAnswer: "",
  marks: "1",
});

// ── Question Form ─────────────────────────────────────────────────────────────

function QuestionForm({ initial, testId, onSave, onCancel, submitLabel }) {
  const [form, setForm]     = useState(initial || emptyForm());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
    setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.questionText.trim()) e.questionText = "Question text is required.";
    if (!form.optionA.trim()) e.optionA = "Required.";
    if (!form.optionB.trim()) e.optionB = "Required.";
    if (!form.optionC.trim()) e.optionC = "Required.";
    if (!form.optionD.trim()) e.optionD = "Required.";
    if (!form.correctAnswer) e.correctAnswer = "Select the correct answer.";
    const m = parseInt(form.marks, 10);
    if (!form.marks || isNaN(m) || m < 1) e.marks = "Min 1.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError("");
    try {
      await onSave({
        questionText:  form.questionText.trim(),
        optionA:       form.optionA.trim(),
        optionB:       form.optionB.trim(),
        optionC:       form.optionC.trim(),
        optionD:       form.optionD.trim(),
        correctAnswer: form.correctAnswer,
        marks:         parseInt(form.marks, 10),
        testId,
      });
    } catch (err) {
      setApiError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.qForm} noValidate>
      <div className={styles.field}>
        <label className={styles.label}>Question <span className={styles.req}>*</span></label>
        <textarea
          className={`${styles.textarea} ${errors.questionText ? styles.fieldError : ""}`}
          placeholder="e.g. What is Newton's second law of motion?"
          value={form.questionText}
          onChange={(e) => set("questionText", e.target.value)}
          disabled={loading}
          rows={3}
          maxLength={1000}
        />
        {errors.questionText && <p className={styles.errMsg}>{errors.questionText}</p>}
      </div>

      <div className={styles.optionsGrid}>
        {OPTION_LABELS.map((lbl) => {
          const field = `option${lbl}`;
          return (
            <div key={lbl} className={styles.field}>
              <label className={styles.label}>Option {lbl} <span className={styles.req}>*</span></label>
              <div className={styles.optionRow}>
                <span className={styles.optionLetter}>{lbl}</span>
                <input
                  type="text"
                  className={`${styles.input} ${errors[field] ? styles.fieldError : ""}`}
                  placeholder={`Enter option ${lbl}`}
                  value={form[field]}
                  onChange={(e) => set(field, e.target.value)}
                  disabled={loading}
                  maxLength={300}
                />
              </div>
              {errors[field] && <p className={styles.errMsg}>{errors[field]}</p>}
            </div>
          );
        })}
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.field}>
          <label className={styles.label}>Correct Answer <span className={styles.req}>*</span></label>
          <div className={styles.answerGroup}>
            {OPTION_LABELS.map((lbl) => (
              <button
                key={lbl}
                type="button"
                className={`${styles.answerBtn} ${form.correctAnswer === lbl ? styles.answerSelected : ""}`}
                onClick={() => set("correctAnswer", lbl)}
                disabled={loading}
              >
                {lbl}
              </button>
            ))}
          </div>
          {errors.correctAnswer && <p className={styles.errMsg}>{errors.correctAnswer}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Marks <span className={styles.req}>*</span></label>
          <input
            type="number" min="1" max="100"
            className={`${styles.input} ${styles.marksInput} ${errors.marks ? styles.fieldError : ""}`}
            value={form.marks}
            onChange={(e) => set("marks", e.target.value)}
            disabled={loading}
          />
          {errors.marks && <p className={styles.errMsg}>{errors.marks}</p>}
        </div>
      </div>

      {apiError && <p className={styles.apiError}>{apiError}</p>}

      <div className={styles.formActions}>
        {onCancel && (
          <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        )}
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <span className={styles.spinner} /> : submitLabel}
        </button>
      </div>
    </form>
  );
}

// ── Question Card ─────────────────────────────────────────────────────────────

function QuestionCard({ question, index, testId, onUpdated, onDeleted, disabled }) {
  const [editing,  setEditing]  = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirm,  setConfirm]  = useState(false);

  const handleSaveEdit = async (payload) => {
    await updateQuestion(question.id, {
      questionText:  payload.questionText,
      optionA:       payload.optionA,
      optionB:       payload.optionB,
      optionC:       payload.optionC,
      optionD:       payload.optionD,
      correctAnswer: payload.correctAnswer,
      marks:         payload.marks,
    });
    setEditing(false);
    onUpdated();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteQuestion(question.id);
      onDeleted();
    } catch {
      setDeleting(false);
      setConfirm(false);
    }
  };

  const initial = {
    questionText:  question.questionText,
    optionA:       question.optionA,
    optionB:       question.optionB,
    optionC:       question.optionC,
    optionD:       question.optionD,
    correctAnswer: question.correctAnswer,
    marks:         String(question.marks),
  };

  return (
    <div className={`${styles.qCard} ${editing ? styles.qCardEditing : ""}`}>
      {!editing && (
        <>
          <div className={styles.qCardHeader}>
            <span className={styles.qNumber}>Q{index + 1}</span>
            <span className={styles.qText}>{question.questionText}</span>
            <div className={styles.qCardActions}>
              <span className={styles.marksPill}>{question.marks} {question.marks === 1 ? "mark" : "marks"}</span>
              <button
                className={styles.iconBtn}
                onClick={() => setEditing(true)}
                disabled={disabled || deleting}
                title="Edit question"
              >
                <EditIcon />
              </button>
              {!confirm ? (
                <button
                  className={`${styles.iconBtn} ${styles.deleteBtn}`}
                  onClick={() => setConfirm(true)}
                  disabled={disabled || deleting}
                  title="Delete question"
                >
                  <TrashIcon />
                </button>
              ) : (
                <div className={styles.confirmRow}>
                  <span className={styles.confirmText}>Delete?</span>
                  <button className={styles.confirmYes} onClick={handleDelete} disabled={deleting}>
                    {deleting ? <span className={styles.spinnerSm} /> : "Yes"}
                  </button>
                  <button className={styles.confirmNo} onClick={() => setConfirm(false)} disabled={deleting}>
                    No
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className={styles.qOptions}>
            {OPTION_LABELS.map((lbl) => (
              <span
                key={lbl}
                className={`${styles.qOption} ${question.correctAnswer === lbl ? styles.qOptionCorrect : ""}`}
              >
                <span className={styles.qOptionLbl}>{lbl}</span>
                {question[`option${lbl}`]}
                {question.correctAnswer === lbl && <span className={styles.correctTick}><CheckIcon /></span>}
              </span>
            ))}
          </div>
        </>
      )}

      {editing && (
        <div className={styles.editFormWrap}>
          <p className={styles.editingLabel}>Editing Q{index + 1}</p>
          <QuestionForm
            initial={initial}
            testId={testId}
            onSave={handleSaveEdit}
            onCancel={() => setEditing(false)}
            submitLabel="Save Changes"
          />
        </div>
      )}
    </div>
  );
}

// ── Main Panel ───────────────────────────────────────────────────────────────

export default function AddQuestion({ test: initialTest, onClose, onTestPublished }) {
  const [test, setTest]               = useState(initialTest);

  // When the parent switches to a different test, reset all state
  useEffect(() => {
    setTest(initialTest);
    setQuestions([]);
    setShowAddForm(false);
    setPubSuccess(false);
    setPubError("");
    setQError("");
  }, [initialTest.id]);
  const [questions, setQuestions]     = useState([]);
  const [loadingQ, setLoadingQ]       = useState(true);
  const [qError, setQError]           = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [publishing, setPublishing]         = useState(false);
  const [pubError, setPubError]             = useState("");
  const [pubSuccess, setPubSuccess]         = useState(false);
  const [confirmDelete, setConfirmDelete]   = useState(false);
  const [deletingTest, setDeletingTest]     = useState(false);
  const [deleteTestErr, setDeleteTestErr]   = useState("");

  const isPublished = test.status === "PUBLISHED";

  const loadQuestions = useCallback(async () => {
    setLoadingQ(true);
    setQError("");
    try {
      const data = await getTestQuestions(test.id);
      setQuestions(data);
    } catch (err) {
      setQError(err.message || "Failed to load questions.");
    } finally {
      setLoadingQ(false);
    }
  }, [test.id]);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  const handleAdded = async (payload) => {
    await createQuestion(payload);
    setShowAddForm(false);
    loadQuestions();
  };

  const handleDeleteTest = async () => {
    setDeletingTest(true);
    setDeleteTestErr("");
    try {
      await deleteTest(test.id);
      onClose(); // closes the panel and refreshes the list
    } catch (err) {
      setDeleteTestErr(err.message || "Failed to delete test.");
      setDeletingTest(false);
      setConfirmDelete(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setPubError("");
    try {
      const updated = await publishTest(test.id);
      setTest(updated);
      setPubSuccess(true);
      if (onTestPublished) onTestPublished(updated);
    } catch (err) {
      setPubError(err.message || "Failed to publish test.");
    } finally {
      setPublishing(false);
    }
  };

  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);

  // No overlay wrapper — rendered directly inside .managePane
  return (
    <div className={styles.panel}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className={styles.panelHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <h2 className={styles.panelTitle}>{test.title}</h2>
            <span className={`${styles.statusBadge} ${isPublished ? styles.statusPublished : styles.statusDraft}`}>
              {isPublished ? "Published" : "Draft"}
            </span>
          </div>
          <div className={styles.metaRow}>
            {test.subjectName && <span className={styles.metaTag}>{test.subjectName}</span>}
            {test.examName    && <span className={styles.metaTag}>{test.examName}</span>}
            {!loadingQ && (
              <span className={styles.metaTag}>{questions.length} question{questions.length !== 1 ? "s" : ""} · {totalMarks} marks</span>
            )}
          </div>
        </div>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className={styles.body}>

        {pubSuccess && (
          <div className={styles.successBanner}>
            <CheckIcon /> Test published! Students can now see and attempt it.
          </div>
        )}

        {pubError && <p className={styles.apiError}>{pubError}</p>}
        {deleteTestErr && <p className={styles.apiError}>{deleteTestErr}</p>}

        {isPublished && (
          <div className={styles.publishedNotice}>
            This test is live. Questions are locked and cannot be modified.
          </div>
        )}

        {loadingQ ? (
          <div className={styles.skeletonList}>
            {[1, 2, 3].map((i) => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : qError ? (
          <div className={styles.errorBox}>
            {qError}
            <button className={styles.retryBtn} onClick={loadQuestions}>Retry</button>
          </div>
        ) : questions.length === 0 && !showAddForm ? (
          <div className={styles.emptyQ}>
            <p className={styles.emptyQText}>No questions yet.</p>
            <p className={styles.emptyQSub}>Add at least one question before publishing.</p>
          </div>
        ) : (
          <div className={styles.questionList}>
            {questions.map((q, i) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={i}
                testId={test.id}
                onUpdated={loadQuestions}
                onDeleted={loadQuestions}
                disabled={isPublished}
              />
            ))}
          </div>
        )}

        {!isPublished && showAddForm && (
          <div className={styles.addFormWrap}>
            <p className={styles.addFormTitle}>New Question</p>
            <QuestionForm
              testId={test.id}
              onSave={handleAdded}
              onCancel={() => setShowAddForm(false)}
              submitLabel="Add Question"
            />
          </div>
        )}

        {!isPublished && !showAddForm && (
          <div className={styles.actionBar}>
            <button
              type="button"
              className={styles.addQBtn}
              onClick={() => setShowAddForm(true)}
              disabled={loadingQ}
            >
              <PlusIcon /> Add Question
            </button>

            <div className={styles.actionBarRight}>
              {!confirmDelete ? (
                <button
                  type="button"
                  className={styles.deleteTestBtn}
                  onClick={() => setConfirmDelete(true)}
                  disabled={publishing || deletingTest}
                >
                  Delete Test
                </button>
              ) : (
                <div className={styles.deleteConfirmRow}>
                  <span className={styles.deleteConfirmText}>Sure?</span>
                  <button
                    type="button"
                    className={styles.deleteConfirmYes}
                    onClick={handleDeleteTest}
                    disabled={deletingTest}
                  >
                    {deletingTest ? <span className={styles.spinnerSm} /> : "Yes, delete"}
                  </button>
                  <button
                    type="button"
                    className={styles.deleteConfirmNo}
                    onClick={() => setConfirmDelete(false)}
                    disabled={deletingTest}
                  >
                    Cancel
                  </button>
                </div>
              )}

              <button
                type="button"
                className={styles.publishBtn}
                onClick={handlePublish}
                disabled={publishing || questions.length === 0 || loadingQ}
                title={questions.length === 0 ? "Add at least one question to publish" : ""}
              >
                {publishing ? <span className={styles.spinner} /> : "Publish Test"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}