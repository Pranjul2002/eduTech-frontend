import React from "react";
import style from "./contact.module.css";

export default function ContactUs() {
  return (
    <div className={style.contactContainer}>
      <div className={style.contactLeft}>
        <h1 className={style.contactTitle}>Contact Us</h1>
        <p className={style.contactSubtitle}>
          Fill in the form below and we’ll get back to you shortly.
        </p>

        <form className={style.contactForm}>
          <input
            type="text"
            placeholder="Your Name"
            required />
          <input
            type="email"
            placeholder="Your Email ID"
            required />
          <input
            type="tel"
            placeholder="Your Contact Number" />
          <textarea
            placeholder="Tell your query"
            rows="4"
            required />
          <button
            type="submit"
            className={style.sendBtn}>
            Submit
          </button>
        </form>

        <div className={style.contactInfo}>
          <h3>Or Call Us</h3>
          <p className={style.contactPhone}>+91 99999 99999</p>
        </div>
      </div>

      <div className={style.contactRight}>
        <div className={style.imageOverlay}>
          <img src="/5114855.jpg" alt="Contact illustration" />
        </div>
      </div>
    </div>
  );
}