import React from "react";
import "./contactStyle.css";

export default function ContactUs() {
  return (
    <div className="contactContainer">
      <div className="contactLeft">
        <h1 className="contactTitle">Contact Us</h1>
        <p className="contactSubtitle">
          Fill in the form below and we’ll get back to you shortly.
        </p>

        <form className="contactForm">
          <input
            type="text"
            placeholder="Your Name"
            required
          />

          <input
            type="email"
            placeholder="Your Email ID"
            required
          />

          <input
            type="tel"
            placeholder="Your Contact Number"
          />

          <textarea
            placeholder="Tell your query"
            rows="4"
            required
          ></textarea>

          <button type="submit" className="sendBtn">
            Submit
          </button>
        </form>

        <div className="contactInfo">
          <h3>Or Call Us</h3>
          <p className="contactPhone">+91 99999 99999</p>
        </div>
      </div>

      <div className="contactRight">
        <div className="imageOverlay">
          <img src="/5114855.jpg"></img>
        </div>
      </div>
    </div>
  );
}