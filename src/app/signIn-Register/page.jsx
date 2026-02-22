"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import style from "./siginRegister.module.css";

const Page = () => {
  const router = useRouter();

  const [isLoginToggle, setIsLoginToggle] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginCredentials, setLoginCredentials] = useState({
    email: "",
    password: "",
  });

  const [signupCredentials, setSignupCredentials] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
  });

  /* ================= LOGIN ================= */

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://192.168.41.188:8080/api/user/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginCredentials),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      // TODO: store JWT securely (httpOnly cookie preferred)
      console.log("Login success:", data);

      router.push("/profile");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= REGISTER ================= */

  const handleRegister = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://192.168.41.188:8080/api/user/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...signupCredentials,
            age: Number(signupCredentials.age),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSignupCredentials({
        name: "",
        email: "",
        password: "",
        age: "",
        gender: "",
      });

      alert("Successfully registered. You can now login.");
      setIsLoginToggle(true);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.signInRegister}>
      {/* ================= HERO ================= */}
      <div className={style.signInRegisterHero}>
        <h1>WELCOME</h1>
        <h6>Start a new journey by joining in.</h6>
      </div>

      {/* ================= FORM CONTAINER ================= */}
      <div className={style.signInRegisterContainer}>
        <div className={style.signInRegisterWrapper}>

          {/* Toggle Buttons */}
          <div className={style.switchButtons}>
            <button
              className={isLoginToggle ? style.activeToggle : ""}
              onClick={() => {
                setIsLoginToggle(true);
                setError("");
              }}
            >
              Sign In
            </button>

            <button
              className={!isLoginToggle ? style.activeToggle : ""}
              onClick={() => {
                setIsLoginToggle(false);
                setError("");
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className={style.errorMessage}>
              {error}
            </div>
          )}

          {/* ================= LOGIN FORM ================= */}
          {isLoginToggle ? (
            <form
              onSubmit={handleLogin}
              className={`${style.form} ${style.loginForm}`}
            >
              <h2>Sign In</h2>

              <input
                type="email"
                placeholder="Email"
                value={loginCredentials.email}
                onChange={(e) =>
                  setLoginCredentials({
                    ...loginCredentials,
                    email: e.target.value,
                  })
                }
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={loginCredentials.password}
                onChange={(e) =>
                  setLoginCredentials({
                    ...loginCredentials,
                    password: e.target.value,
                  })
                }
                required
              />

              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>
          ) : (
            /* ================= REGISTER FORM ================= */
            <form
              onSubmit={handleRegister}
              className={`${style.form} ${style.registerForm}`}
            >
              <h2>Sign Up</h2>

              <input
                type="text"
                placeholder="Full Name"
                value={signupCredentials.name}
                onChange={(e) =>
                  setSignupCredentials({
                    ...signupCredentials,
                    name: e.target.value,
                  })
                }
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={signupCredentials.email}
                onChange={(e) =>
                  setSignupCredentials({
                    ...signupCredentials,
                    email: e.target.value,
                  })
                }
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={signupCredentials.password}
                onChange={(e) =>
                  setSignupCredentials({
                    ...signupCredentials,
                    password: e.target.value,
                  })
                }
                required
              />

              <select
                value={signupCredentials.gender}
                onChange={(e) =>
                  setSignupCredentials({
                    ...signupCredentials,
                    gender: e.target.value,
                  })
                }
                required
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <input
                type="number"
                placeholder="Age"
                min="1"
                value={signupCredentials.age}
                onChange={(e) =>
                  setSignupCredentials({
                    ...signupCredentials,
                    age: e.target.value,
                  })
                }
                required
              />

              <button type="submit" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;