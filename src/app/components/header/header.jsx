"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import style from './header.module.css'

const header = () => {
    
    const [menuOpen, setMenuOpen] = useState(false)

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const closeMenu = () => setMenuOpen(false)

    return (
        <div id={style.header}>
            <button className={style.menuToggleButton} onClick={toggleMenu}>
                {menuOpen ? 'X' : '='}
            </button>

            <div className={`${style.container} ${menuOpen ? style.menuOpen : ''}`}>
                <div className={style.headerCol1}>
                    <div className={style.logo}>EduTech</div>
                    <button className={style.exploreTestButton}>
                        Explore Test
                        <div className={style.exploreTestButtonDropdownMenu}>
                            <div className={style.testTypeList}>
                                <ul>
                                    <li>Competitive Exams</li>
                                    <li>School Preparation</li>
                                    <li>School Boards</li>
                                    <li>Other</li>
                                </ul>
                            </div>
                        </div>
                    </button>
                </div>
                <div className={style.headerCol2}>
                    <div className={style.menuItemContainer}>
                        <ul className={style.menuItem}>
                            <Link href="/" className={`${style.item} ${style.i1}`} onClick={closeMenu}><li>Home</li></Link>
                            <Link href="/" className={`${style.item} ${style.i2}`} onClick={closeMenu}><li>Upsilling</li></Link>
                            <Link href="/" className={`${style.item} ${style.i3}`} onClick={closeMenu}><li>Tests</li></Link>
                            <Link href="/products" className={`${style.item} ${style.i4}`} onClick={closeMenu}><li>Products</li></Link>
                            <Link href="/" className={`${style.item} ${style.i5}`} onClick={closeMenu}><li>About</li></Link>
                            <Link href="/contact" className={`${style.item} ${style.i6}`}><li>Contact</li></Link>
                        </ul>
                    </div>
                </div>
                <div className={style.headerCol3}>
                    <Link href="/signIn-Register" className={style.loginRegisterButton} onClick={closeMenu}>Sign in/Register</Link>
                </div>
            </div>
        </div>
    )
}

export default header