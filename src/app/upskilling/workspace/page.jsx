"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PanelLeftOpen } from "lucide-react";
import WorkspaceHeader from "./components/WorkspaceHeader";
import SourcesPanel from "./components/SourcesPanel";
import StudioPanel from "./components/StudioPanel";
import MainPanel from "./components/MainPanel";
import SourceDetailPanel from "./components/SourceDetailPanel";
import MobileNav from "./components/MobileNav/MobileNav";
import styles from "./workspace.module.css";
import { useFiles } from "../context/FileContext";
import { useAuth } from "@/context/AuthContext";

export default function UpskillingWorkspacePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [activePanel, setActivePanel] = useState("sources");
  const [mobileTab, setMobileTab] = useState("chat");
  const { sources, addFiles } = useFiles();
  const { isAuthenticated, authLoading } = useAuth();

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
    setMobileTab("chat");
  };

  const layoutClassName = [styles.layout, !activePanel ? styles.panelClosed : ""]
    .filter(Boolean).join(" ");

  if (authLoading || !isAuthenticated || sources.length === 0) return null;

  return (
    <main className={styles.page} data-page="upskilling-workspace">
      <WorkspaceHeader onMenuClick={() => setActivePanel(activePanel ? null : "sources")} />

      {/* ── Desktop 3-column layout ── */}
      <motion.section
        className={layoutClassName}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
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

        <motion.div
          style={{ minHeight: 0, height: "100%", display: "flex", flexDirection: "column" }}
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <MainPanel onUploadClick={openFilePicker} />
        </motion.div>

        <motion.aside
          style={{ height: "100%", minHeight: 0 }}
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <SourceDetailPanel />
        </motion.aside>
      </motion.section>

      {/* ── Mobile single-panel view ── */}
      <div className={styles.mobileView}>
        <AnimatePresence mode="wait">
          {mobileTab === "chat" && (
            <motion.div
              key="chat"
              className={styles.mobilePanelWrap}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <MainPanel onUploadClick={openFilePicker} />
            </motion.div>
          )}
          {mobileTab === "sources" && (
            <motion.div
              key="sources"
              className={styles.mobilePanelWrap}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <SourcesPanel onUploadClick={openFilePicker} onClose={() => setMobileTab("chat")} />
            </motion.div>
          )}
          {mobileTab === "studio" && (
            <motion.div
              key="studio"
              className={styles.mobilePanelWrap}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <StudioPanel onClose={() => setMobileTab("chat")} />
            </motion.div>
          )}
          {mobileTab === "settings" && (
            <motion.div
              key="settings"
              className={styles.mobilePanelWrap}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <SourceDetailPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mobile bottom nav ── */}
      <MobileNav
        activeTab={mobileTab}
        onTabChange={setMobileTab}
        onAddClick={openFilePicker}
      />

      <input ref={fileInputRef} type="file" hidden multiple onChange={handleFileChange} />
    </main>
  );
}