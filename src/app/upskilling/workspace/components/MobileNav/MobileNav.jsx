"use client";

import { MessageSquare, FolderOpen, Plus, BarChart2, Settings } from "lucide-react";
import styles from "./MobileNav.module.css";

const NAV_ITEMS = [
  { id: "chat",     label: "Chat",    Icon: MessageSquare },
  { id: "sources",  label: "Sources", Icon: FolderOpen    },
  { id: "studio",   label: "Studio",  Icon: BarChart2     },
  { id: "settings", label: "Settings",Icon: Settings      },
];

export default function MobileNav({ activeTab, onTabChange, onAddClick }) {
  return (
    <nav className={styles.nav} aria-label="Mobile workspace navigation">
      {NAV_ITEMS.slice(0, 2).map(({ id, label, Icon }) => (
        <NavItem
          key={id}
          id={id}
          label={label}
          Icon={Icon}
          active={activeTab === id}
          onClick={() => onTabChange(id)}
        />
      ))}

      <button
        type="button"
        className={styles.fab}
        onClick={onAddClick}
        aria-label="Add source"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      {NAV_ITEMS.slice(2).map(({ id, label, Icon }) => (
        <NavItem
          key={id}
          id={id}
          label={label}
          Icon={Icon}
          active={activeTab === id}
          onClick={() => onTabChange(id)}
        />
      ))}
    </nav>
  );
}

function NavItem({ id, label, Icon, active, onClick }) {
  return (
    <button
      type="button"
      className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={20} strokeWidth={active ? 2.2 : 1.8} className={styles.navIcon} />
      <span className={styles.navLabel}>{label}</span>
    </button>
  );
}