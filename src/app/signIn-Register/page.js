"use client";
import React, { useState } from "react";
import "./siginRegisterStyle.css";

const SignInUp = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false); // New state

  const toggleForm = () => setIsLogin(!isLogin);
  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <div id="sigInOrRegister" className={isLogin ? "loginActive" : "registerActive"}>
      {/* Hero Section */}
      <div className="heroSection">
        <div className="heroContent">
          <h1>{isLogin ? "Welcome Back" : "Join Us Today"}</h1>
          <p>
            {isLogin
              ? "Sign in to continue your journey with us."
              : "Create an account to explore all features."}
          </p>
          <button className="toggleBtn" onClick={toggleForm}>
            {isLogin ? "Register" : "Sign In"}
          </button>
        </div>
      </div>

      {/* Form Section */}
      <div className="loginOrRegisterForm">
        <div className="loginOrRegisterFormContainer">
          {/* Login Form */}
          {isLogin && (
            <form className="authForm">
              <h2 className="formTitle">Login</h2>

              <div className="inputGroup">
                <label htmlFor="loginEmail">Email</label>
                <input
                  type="email"
                  id="loginEmail"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="inputGroup passwordGroup">
                <label htmlFor="loginPassword">Password</label>
                <input
                  type={showPassword ? "text" : "password"} // toggle type
                  id="loginPassword"
                  placeholder="Enter your password"
                  required
                />
                <span
                  className="showPassword"
                  onClick={togglePassword}
                >
                  {showPassword ? "Hide" : "Show"}
                </span>
              </div>

              <div className="formOptions">
                <div className="rememberMe">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <a href="#" className="forgotPassword">
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="primaryBtn">
                Sign In
              </button>
            </form>
          )}

          {/* Register Form */}
          {!isLogin && (
            <form className="authForm">
              <h2 className="formTitle">Register</h2>

              <div className="inputGroup">
                <label htmlFor="regName">Full Name</label>
                <input
                  type="text"
                  id="regName"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="inputGroup">
                <label htmlFor="regEmail">Email</label>
                <input
                  type="email"
                  id="regEmail"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="inputGroup passwordGroup">
                <label htmlFor="regPassword">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="regPassword"
                  placeholder="Enter a password"
                  required
                />
                <span
                  className="showPassword"
                  onClick={togglePassword}
                >
                  {showPassword ? "Hide" : "Show"}
                </span>
              </div>

              <button type="submit" className="primaryBtn">
                Register
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignInUp;
