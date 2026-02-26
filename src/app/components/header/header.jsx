"use client"

import React, { useState } from "react"
import Link from "next/link"
import styles from "./header.module.css"

const Header = () => {

    const [menuOpen, setMenuOpen] = useState(false)

    const toggleMenu = () => setMenuOpen(prev => !prev)
    const closeMenu = () => setMenuOpen(false)

    return (
        <div className={styles.header}>

            <button
                className={styles.menuToggleButton}
                onClick={toggleMenu}
            >
                {menuOpen ? "X" : "☰"}
            </button>

            <div className={`${styles.container} ${menuOpen ? styles.menuOpen : ""}`}>

                {/* Column 1 */}
                <div className={styles.headerCol1}>
                    <div className={styles.logo}>EduTech</div>

                    <div className={styles.exploreTestButton}>
                        Explore Test

                        <div className={styles.exploreTestButtonDropdownMenu}>
                            <div className={styles.testTypeList}>
                                <ul>
                                    <Link href="/products/competetive/jee" onClick={closeMenu}>
                                        <li>
                                            JEE Preparation
                                        </li>
                                    </Link>
                                    <Link href="/products/competetive/neet" onClick={closeMenu}>
                                        <li>
                                            NEET Preparation
                                        </li>
                                    </Link>
                                    <Link href="/products/class_10" onClick={closeMenu}>
                                        <li>
                                            School 10th Boards
                                        </li>
                                    </Link>
                                    <Link href="/products/class_12" onClick={closeMenu}>
                                        <li>
                                            School 12th Boards
                                        </li>
                                    </Link>
                                    <Link href="/products" onClick={closeMenu}>
                                        <li>
                                            All
                                        </li>
                                    </Link>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2 */}
                <div className={styles.headerCol2}>
                    <div className={styles.menuItemContainer}>
                        <ul className={styles.menuItem}>
                            <Link href="/" className={styles.item} onClick={closeMenu}><li>Home</li></Link>
                            <Link href="/" className={styles.item} onClick={closeMenu}><li>Upskilling</li></Link>
                            <Link href="/test" className={styles.item} onClick={closeMenu}><li>Tests</li></Link>
                            <Link href="/products" className={styles.item} onClick={closeMenu}><li>Products</li></Link>
                            <Link href="/" className={styles.item} onClick={closeMenu}><li>About</li></Link>
                            <Link href="/contact" className={styles.item} onClick={closeMenu}><li>Contact</li></Link>
                        </ul>
                    </div>
                </div>

                {/* Column 3 */}
                <div className={styles.headerCol3}>
                    <Link
                        href="/signIn-Register"
                        className={styles.loginRegisterButton}
                        onClick={closeMenu}
                    >
                        Sign in / Register
                    </Link>
                </div>

            </div>
        </div>
    )
}

export default Header