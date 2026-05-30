"use client";

import { useEffect, useMemo, useState } from "react";

export const NAV_ITEMS = [
  { id: "overview",  label: "Overview",  icon: "overview"  },
  { id: "mytest",    label: "My Tests",  icon: "mytest"    },
  { id: "mybooks",   label: "My Books",  icon: "mybooks"   },
];

const TAB_KEY     = "dashboard-active-tab";
const SIDEBAR_KEY = "dashboard-sidebar-collapsed";

export function useDashboard() {
  const [activeTab,  setActiveTab]  = useState("overview");
  const [collapsed,  setCollapsed]  = useState(false);
  const [hydrated,   setHydrated]   = useState(false);

  useEffect(() => {
    const savedTab       = window.localStorage.getItem(TAB_KEY);
    const savedCollapsed = window.localStorage.getItem(SIDEBAR_KEY);

    if (savedTab && NAV_ITEMS.some((item) => item.id === savedTab)) {
      setActiveTab(savedTab);
    }

    if (savedCollapsed === "true") {
      setCollapsed(true);
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(TAB_KEY, activeTab);
  }, [activeTab, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(SIDEBAR_KEY, String(collapsed));
  }, [collapsed, hydrated]);

  const activeItem = useMemo(
    () => NAV_ITEMS.find((item) => item.id === activeTab) ?? NAV_ITEMS[0],
    [activeTab]
  );

  return {
    activeTab,
    setActiveTab,
    collapsed,
    setCollapsed,
    activeItem,
  };
}