"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { House, Sparkles, Package, Info, Phone } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import styles from "./header.module.css";

import headerLogo from "../../assets/logo.png";
import { useAuth } from "@/context/AuthContext";

// Add to your global CSS or layout:
// @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

const NAV_LINKS = [
  { href: "/",          label: "Home",      icon: House     },
  { href: "/upskilling", label: "ReviseAI ✨", icon: Sparkles },
  { href: "/products",  label: "Products",  icon: Package   },
  { href: "/about-us",  label: "About",     icon: Info      },
  { href: "/contact-us", label: "Contact",  icon: Phone     },
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
  const [exploreOpen, setExploreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const exploreRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target)) {
        setExploreOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Close everything on route change
  useEffect(() => {
    setExploreOpen(false);
    setProfileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const toggleMenu = () => {
    setMenuOpen((prev) => {
      const next = !prev;
      document.body.style.overflow = next ? "hidden" : "";
      return next;
    });
    setExploreOpen(false);
    setProfileOpen(false);
  };

  const closeAll = () => {
    setMenuOpen(false);
    setExploreOpen(false);
    setProfileOpen(false);
    document.body.style.overflow = "";
  };

  const userInitial = user?.name
    ? user.name.trim().charAt(0).toUpperCase()
    : user?.email
      ? user.email.trim().charAt(0).toUpperCase()
      : "U";

  const handleLogout = async () => {
    await logout();
    closeAll();
    router.push("/auth");
    router.refresh();
  };

  const handleDashboardClick = () => {
    closeAll();
    router.push("/dashboard");
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} onClick={closeAll}>
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

            {/* ── Explore (click-toggled) ── */}
            <div className={styles.exploreWrapper} ref={exploreRef}>
              <button
                type="button"
                className={`${styles.exploreButton} ${exploreOpen ? styles.exploreButtonOpen : ""}`}
                onClick={() => setExploreOpen((prev) => !prev)}
                aria-expanded={exploreOpen}
              >
                Explore Tests
              </button>

              <div className={`${styles.exploreDropdown} ${exploreOpen ? styles.dropdownVisible : ""}`}>
                <ul className={styles.exploreList}>
                  {EXPLORE_LINKS.map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href} onClick={closeAll}>
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
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`${styles.item} ${
                      pathname === href ? styles.activeItem : ""
                    }`}
                    onClick={closeAll}
                  >
                    <Icon size={16} strokeWidth={1.8} color="black" className={styles.lucideIcon}/>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.rightActions}>
            {authLoading ? null : isAuthenticated ? (

              /* ── Profile (click-toggled) ── */
              <div className={styles.profileDropdownWrapper} ref={profileRef}>
                <button
                  type="button"
                  className={`${styles.profileAvatar} ${profileOpen ? styles.profileAvatarOpen : ""}`}
                  onClick={() => setProfileOpen((prev) => !prev)}
                  aria-expanded={profileOpen}
                >
                  <span>{userInitial}</span>
                </button>

                <div className={`${styles.profileDropdownMenu} ${profileOpen ? styles.dropdownVisible : ""}`}>
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
                onClick={closeAll}
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