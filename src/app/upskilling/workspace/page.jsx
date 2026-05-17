"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PanelLeftOpen } from "lucide-react";
import WorkspaceHeader from "./components/WorkspaceHeader";
import SourcesPanel from "./components/SourcesPanel";
import StudioPanel from "./components/StudioPanel";
import MainPanel from "./components/MainPanel";
import SourceDetailPanel from "./components/SourceDetailPanel";
import styles from "./workspace.module.css";
import { useFiles } from "../context/FileContext";
import { useAuth } from "@/context/AuthContext";

export default function UpskillingWorkspacePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [activePanel, setActivePanel] = useState("sources");
  const { sources, addFiles } = useFiles();
  const { isAuthenticated, authLoading } = useAuth();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/auth?redirect=/upskilling/workspace");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (sources.length === 0) router.replace("/upskilling");
  }, [router, sources.length]);

  const openFilePicker = () => {
    if (!isAuthenticated) {
      router.push("/auth?redirect=/upskilling/workspace");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;
    addFiles(selectedFiles);
    event.target.value = "";
  };

  const layoutClassName = [styles.layout, !activePanel ? styles.panelClosed : ""]
    .filter(Boolean).join(" ");

  if (authLoading || !isAuthenticated || sources.length === 0) return null;

  return (
    <main className={styles.page} data-page="upskilling-workspace">
      <WorkspaceHeader />

      <motion.section
        className={layoutClassName}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {/* ── Left panel: Sources / Studio ── */}
        {activePanel ? (
          <motion.aside
            className={styles.mergedPanel}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className={styles.panelTabs}>
              <button
                type="button"
                className={`${styles.tabButton} ${activePanel === "sources" ? styles.tabActive : ""}`}
                onClick={() => setActivePanel("sources")}
              >
                Sources
              </button>
              <button
                type="button"
                className={`${styles.tabButton} ${activePanel === "studio" ? styles.tabActive : ""}`}
                onClick={() => setActivePanel("studio")}
              >
                Studio
              </button>
            </div>

            <div className={styles.panelBody}>
              {activePanel === "sources" && (
                <SourcesPanel onUploadClick={openFilePicker} onClose={() => setActivePanel(null)} />
              )}
              {activePanel === "studio" && (
                <StudioPanel onClose={() => setActivePanel(null)} />
              )}
            </div>
          </motion.aside>
        ) : (
          <button
            type="button"
            className={styles.sideRail}
            onClick={() => setActivePanel("sources")}
            aria-label="Open side panel"
          >
            <PanelLeftOpen size={16} />
            <span>Open panel</span>
          </button>
        )}

        {/* ── Middle column: AI Chat / Assessment ── */}
        <motion.div
          style={{ minHeight: 0, height: "100%", display: "flex", flexDirection: "column" }}
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <MainPanel onUploadClick={openFilePicker} />
        </motion.div>

        {/* ── Right column: About this source ── */}
        <motion.aside
          style={{ height: "100%", minHeight: 0 }}
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <SourceDetailPanel />
        </motion.aside>
      </motion.section>

      <input ref={fileInputRef} type="file" hidden multiple onChange={handleFileChange} />
    </main>
  );
}