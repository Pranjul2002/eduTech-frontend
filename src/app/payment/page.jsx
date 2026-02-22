"use client";
import { useState } from "react";
import "./payment.css";

export default function PaymentPage() {
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2500);
  };

  if (success) {
    return (
      <div className="success-screen">
        <h2>🎉 Payment Successful!</h2>
        <p>Thank you for your purchase.</p>
      </div>
    );
  }

  return (
    <div className="checkout-wrapper">
      <div className="checkout-container">

        {/* LEFT SIDE - Course Details */}
        <div className="course-section">
          <h2>Subject Mastery Tests</h2>
          <p className="instructor">By Toppers</p>

          <ul className="features">
            <li>✔ 1000+ Questions</li>
            <li>✔ Lifetime Access</li>
            <li>✔ Certificate of Completion</li>
          </ul>

          <div className="price-box">
            <span>Course Price</span>
            <h3>₹499</h3>
          </div>

          <div className="secure-badge">
            🔒 100% Secure Checkout
          </div>
        </div>

        {/* RIGHT SIDE - Payment Section */}
        <div className="payment-section">
          <h3>Payment Details</h3>

          {/* Payment Methods */}
          <div className="payment-methods">
            <button
              className={`method-btn ${method === "card" ? "active" : ""}`}
              onClick={() => setMethod("card")}
            >
              💳 Card
            </button>

            <button
              className={`method-btn ${method === "upi" ? "active" : ""}`}
              onClick={() => setMethod("upi")}
            >
              📲 UPI
            </button>

            <button
              className={`method-btn ${method === "netbanking" ? "active" : ""}`}
              onClick={() => setMethod("netbanking")}
            >
              🏦 Net Banking
            </button>

            <button
              className={`method-btn ${method === "wallet" ? "active" : ""}`}
              onClick={() => setMethod("wallet")}
            >
              👛 Wallet
            </button>
          </div>

          {/* ================= CARD FORM ================= */}
          {method === "card" && (
            <div className="form-content">
              <input type="text" placeholder="Card Number" />
              <input type="text" placeholder="Card Holder Name" />
              <div className="row">
                <input type="text" placeholder="MM/YY" />
                <input type="text" placeholder="CVV" />
              </div>
            </div>
          )}

          {/* ================= UPI FORM ================= */}
          {method === "upi" && (
            <div className="form-content">
              <input type="text" placeholder="Enter UPI ID (example@upi)" />
            </div>
          )}

          {/* ================= NET BANKING ================= */}
          {method === "netbanking" && (
            <div className="form-content">
              <select className="bank-select">
                <option>Select Your Bank</option>
                <option>State Bank of India</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
              </select>
            </div>
          )}

          {/* ================= WALLET ================= */}
          {method === "wallet" && (
            <div className="form-content">
              <select className="bank-select">
                <option>Select Wallet</option>
                <option>Paytm</option>
                <option>PhonePe</option>
                <option>Amazon Pay</option>
              </select>
            </div>
          )}

          <button className="pay-btn" onClick={handlePayment}>
            {loading ? <div className="spinner"></div> : "Pay Now ₹499"}
          </button>

          <p className="terms">
            By completing your purchase, you agree to our Terms & Conditions.
          </p>
        </div>

      </div>
    </div>
  );
}