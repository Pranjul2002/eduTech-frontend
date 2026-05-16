import React from "react";
import Link from "next/link";
import Image from "next/image";
import style from "./footer.module.css";
import headerLogo from "../../assets/logo.png";

// Add to your global CSS or layout:
// @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,450;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');

const Footer = () => {
  return (
    <footer className={style.footer}>
      <div className={style.footerWrapper}>
        <div className={style.footerAboutAndMore}>

          {/* ── Brand + Motto ── */}
          <div className={style.logoAndMoto}>
            <div className={style.logo}>
              <Link href="/">
                <div className={style.logoWrapper}>
                  <Image
                    src={headerLogo}
                    alt="EduTech Logo"
                    fill
                    className={style.logoImage}
                  />
                </div>
              </Link>
            </div>
            <p className={style.moto}>
              Practice is the only force that
              <br />
              transforms potential into identity.
            </p>
          </div>

          {/* ── Link Columns ── */}
          <div className={style.importantLinks}>
            <div className={style.productLinks}>
              <h4>Product</h4>
              <ul className={style.listWrapper}>
                <li className={style.listItem}>Mock Tests</li>
                <li className={style.listItem}>Practice Sets</li>
                <li className={style.listItem}>Mentor Support</li>
              </ul>
            </div>

            <div className={style.companyLinks}>
              <h4>Company</h4>
              <ul className={style.listWrapper}>
                <li className={style.listItem}>About Us</li>
                <li className={style.listItem}>Contact Us</li>
              </ul>
            </div>

            <div className={style.socialLinks}>
              <h4>Social</h4>
              <ul className={style.listWrapper}>
                <li className={style.listItem}>Twitter</li>
                <li className={style.listItem}>LinkedIn</li>
                <li className={style.listItem}>GitHub</li>
              </ul>
            </div>

            <div className={style.legalLinks}>
              <h4>Legal</h4>
              <ul className={style.listWrapper}>
                <li className={style.listItem}>Terms</li>
                <li className={style.listItem}>Privacy Policy</li>
                <li className={style.listItem}>Cookies</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className={style.footerTermsAndCopyright}>
          <div className={style.termsAndCopyright}>
            © 2026 Ultima. All rights reserved.
          </div>
          <div className={style.socialLinksIcon}>
            Built for focused learning.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;