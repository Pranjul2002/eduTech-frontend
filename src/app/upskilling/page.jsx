"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserRound, Zap, Asterisk, ArrowRight } from "lucide-react";
import LandingCard from "./components/LandingCard";
import styles from "./upskilling.module.css";
import { useFiles } from "./context/FileContext";
import { useAuth } from "@/context/AuthContext";

const featureItems = [
  {
    icon: UserRound,
    title: "Upload your sources",
    description:
      "Upload PDFs, websites, YouTube videos, audio files, Google Docs, Google Slides and more. Organize everything in one place and start working with your content immediately.",
  },
  {
    icon: Zap,
    title: "Get instant insights",
    description:
      "Once your sources are added, the workspace becomes a focused research environment where you can explore ideas, ask questions, and build understanding faster.",
  },
  {
    icon: Asterisk,
    title: "Work from grounded answers",
    description:
      "Move from raw content to structured thinking with a cleaner workflow for research, summaries, notes, and source-based exploration.",
  },
];

function MagneticButton({ children, className, onClick, type = "button", icon }) {
  const [style, setStyle] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) * 0.12;
    const y = (e.clientY - (rect.top + rect.height / 2)) * 0.12;
    setStyle({ x, y });
  };

  const handleMouseLeave = () => setStyle({ x: 0, y: 0 });

  return (
    <motion.button
      type={type}
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: style.x, y: style.y }}
      transition={{ type: "spring", stiffness: 220, damping: 18, mass: 0.5 }}
    >
      <span className={styles.buttonInner}>
        {children}
        {icon}
      </span>
    </motion.button>
  );
}

function GlowCard({ children, className }) {
  const [glow, setGlow] = useState({ x: "50%", y: "50%", visible: false });

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGlow({ x: `${e.clientX - rect.left}px`, y: `${e.clientY - rect.top}px`, visible: true });
  };

  const handleLeave = () => setGlow((prev) => ({ ...prev, visible: false }));

  return (
    <motion.article
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      style={{
        "--glow-x": glow.x,
        "--glow-y": glow.y,
        "--glow-opacity": glow.visible ? 1 : 0,
      }}
    >
      {children}
    </motion.article>
  );
}

export default function UpskillingPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { addFiles } = useFiles();
  const { isAuthenticated, authLoading } = useAuth();  // ← auth state
  const [showNotebookEntry, setShowNotebookEntry] = useState(false);

  // If user is logged in → open file picker; otherwise → redirect to login
  const handleTryWorkspace = () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/auth?redirect=/upskilling");
      return;
    }
    setShowNotebookEntry(true);
  };

  const handleOpenFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles);
      router.push("/upskilling/workspace");
    }
  };

  // Called when user picks a sample PDF — treat it just like a real upload
  const handleSampleSelect = (file) => {
    addFiles([file]);
    router.push("/upskilling/workspace");
  };

  if (showNotebookEntry) {
    return (
      <main className={styles.page}>
        <div className={styles.backgroundGlow} />
        <LandingCard
          onUploadClick={handleOpenFilePicker}
          onSampleClick={handleSampleSelect}
        />
        <input ref={fileInputRef} type="file" hidden multiple onChange={handleFileChange} />
      </main>
    );
  }

  return (
    <main className={styles.showcasePage}>
      <div className={styles.orbOne} />
      <div className={styles.orbTwo} />
      <div className={styles.gridOverlay} />

      <motion.section
        className={styles.heroSection}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <div className={styles.heroBadge}>AI Research Workspace</div>

        <h1 className={styles.heroTitle}>
          Self <span className={styles.heroGradientText}>Analysis</span> & Understand{" "}
          <span className={styles.heroGradientText}>more</span>
        </h1>

        <p className={styles.heroSubtitle}>
          A focused space where you can do self study in all aspect with structured preparation.
        </p>

        <div className={styles.heroActions}>
          <MagneticButton className={styles.tryButton} onClick={handleTryWorkspace}>
            {authLoading ? "Loading…" : "Try Workspace"}
          </MagneticButton>

          <MagneticButton
            className={styles.secondaryButton}
            onClick={() => {
              const section = document.getElementById("features");
              section?.scrollIntoView({ behavior: "smooth" });
            }}
            icon={<ArrowRight size={18} />}
          >
            See how it works
          </MagneticButton>
        </div>
      </motion.section>

      <section className={styles.statsSection}>
        {[
          "Upload and organize your source files",
          "Enter the workspace and review sources",
          "Chat, generate outputs, and build notes",
        ].map((text, index) => (
          <GlowCard key={text} className={styles.statCard}>
            <span className={styles.statNumber}>{String(index + 1).padStart(2, "0")}</span>
            <p className={styles.statText}>{text}</p>
          </GlowCard>
        ))}
      </section>

      <section id="features" className={styles.featuresSection}>
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <p className={styles.sectionEyebrow}>Why use it</p>
          <h2 className={styles.sectionTitle}>AI-powered self preparation workspace</h2>
          <p className={styles.sectionDescription}>
            A simpler layout, a clearer workflow, and one place to move from source material to
            actual understanding.
          </p>
        </motion.div>

        <div className={styles.featureGrid}>
          {featureItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <GlowCard key={item.title} className={styles.featureCard}>
                <motion.div
                  className={styles.featureIconWrap}
                  initial={{ scale: 0.96, opacity: 0.9 }}
                  whileHover={{ scale: 1.06, rotate: -3 }}
                  transition={{ duration: 0.22 }}
                >
                  <Icon size={24} strokeWidth={2.2} />
                </motion.div>

                <h3 className={styles.featureTitle}>{item.title}</h3>
                <p className={styles.featureDescription}>{item.description}</p>
                <div className={styles.featureIndex}>{String(index + 1).padStart(2, "0")}</div>
              </GlowCard>
            );
          })}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <GlowCard className={styles.ctaCard}>
          <div>
            <p className={styles.ctaEyebrow}>Ready to start?</p>
            <h3 className={styles.ctaTitle}>Open the upload flow and enter your workspace</h3>
            <p className={styles.ctaText}>
              Start with a document, then continue into the workspace you already built.
            </p>
          </div>
          <MagneticButton className={styles.ctaButton} onClick={handleTryWorkspace}>
            Try Workspace
          </MagneticButton>
        </GlowCard>
      </section>

      <input ref={fileInputRef} type="file" hidden multiple onChange={handleFileChange} />
    </main>
  );
}