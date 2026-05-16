"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import styles from "./header.module.css";

import headerLogo from "../../assets/logo.png";
import { useAuth } from "@/context/AuthContext";

// Add this to your global CSS or layout:
// @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/upskilling", label: "ReviseAI ✨" },
  { href: "/products", label: "Products" },
  { href: "/about-us", label: "About" },
  { href: "/contact-us", label: "Contact" },
];

const EXPLORE_LINKS = [
  { href: "/products/competitive/jee", label: "JEE Preparation" },
  { href: "/products/competitive/neet", label: "NEET Preparation" },
  { href: "/products/class_10", label: "School 10th Boards" },
  { href: "/products/class_12", label: "School 12th Boards" },
  { href: "/products", label: "All Tests" },
];

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, authLoading, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const userInitial = user?.name
    ? user.name.trim().charAt(0).toUpperCase()
    : user?.email
      ? user.email.trim().charAt(0).toUpperCase()
      : "U";

  const handleLogout = async () => {
    await logout();
    closeMenu();
    router.push("/auth");
    router.refresh();
  };

  const handleDashboardClick = () => {
    closeMenu();
    router.push("/dashboard");
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} onClick={closeMenu}>
          <div className={styles.logoWrapper}>
            <Image
              src={headerLogo}
              alt="EduTech Logo"
              fill
              sizes="52px"
              className={styles.logoImage}
            />
          </div>
        </Link>

        <button
          className={styles.menuToggleButton}
          onClick={toggleMenu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          type="button"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div className={`${styles.navArea} ${menuOpen ? styles.menuOpen : ""}`}>
          <div className={styles.leftActions}>
            <div className={styles.exploreWrapper}>
              <button type="button" className={styles.exploreButton}>
                Explore Tests
              </button>

              <div className={styles.exploreDropdown}>
                <ul className={styles.exploreList}>
                  {EXPLORE_LINKS.map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href} onClick={closeMenu}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <nav className={styles.nav}>
            <ul className={styles.menuItem}>
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`${styles.item} ${
                      pathname === href ? styles.activeItem : ""
                    }`}
                    onClick={closeMenu}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.rightActions}>
            {authLoading ? null : isAuthenticated ? (
              <div className={styles.profileDropdownWrapper}>
                <button type="button" className={styles.profileAvatar}>
                  <span>{userInitial}</span>
                </button>

                <div className={styles.profileDropdownMenu}>
                  <button
                    type="button"
                    className={styles.dropdownItem}
                    onClick={handleDashboardClick}
                  >
                    Dashboard
                  </button>

                  <button
                    type="button"
                    className={styles.dropdownItem}
                    onClick={handleDashboardClick}
                  >
                    Profile
                  </button>

                  <div className={styles.dropdownDivider} />

                  <button
                    className={styles.dropdownLogout}
                    onClick={handleLogout}
                    type="button"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth"
                className={styles.loginRegisterButton}
                onClick={closeMenu}
              >
                Sign in / Register
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;