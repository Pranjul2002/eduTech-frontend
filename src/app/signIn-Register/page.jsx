"use client";

import React, { useState } from "react";
import style from "./siginRegister.module.css";
import { useRouter } from "next/navigation";

const Page = () => {

  const [isLoginToggle, setIsLoginToggle]=useState(true);

  const [loading, setLoading] = useState(false);  //for waiting on logging in or registering in
  const [error, setError] = useState("");    //for storing backend error like 401(invalid credentials), 400(validation error)

  const router=useRouter();

  const [loginCredentials, setLoginCredentials]=useState({
    email: "",
    password: ""
  })

  const [signupCredentials, setSignupCredentials]=useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: ""
  });

  

  const handleLogin = async (e) => {
    e.preventDefault(); // prevent page reload

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://192.168.41.188:8080/api/user/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginCredentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      console.log("Login success", data.message);

      // Later: store JWT here

      router.push("/profile");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


/*
  const handleDummyLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    // simulate network delay
    setTimeout(() => {

      // Dummy credentials
      const dummyEmail = "test@example.com";
      const dummyPassword = "123456";

      if (
        loginCredentials.email === dummyEmail &&
        loginCredentials.password === dummyPassword
      ) {
        alert("Login Successful ✅");

        // clear form
        setLoginCredentials({
          email: "",
          password: ""
        });

        // simulate storing token
        localStorage.setItem("token", "dummy-jwt-token");

        router.push("/profile");

      } else {
        setError("Invalid email or password ❌");
      }

      setLoading(false);

    }, 1000); // 1 second fake delay
  };
*/






  const handleRegister = async (e) => {
    e.preventDefault();   // stop browser from reloading page

    setLoading(true);     // show loading state
    setError("");         // clear previous errors

    try {
      const response = await fetch("http://192.168.41.188:8080/api/user/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...signupCredentials,
          age: Number(signupCredentials.age) // convert age string to number
        })
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      //const data = await response.json();
      console.log("Registration success");
      
      setSignupCredentials({
        name: "",
        email: "",
        password: "",
        age: "",
        gender: ""
      });

      alert("Sucessfully register You can now Login");
      // After successful registration, switch to login form
      setIsLoginToggle(true);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.signInRegister}>
      <div className={style.signInRegisterHero}>
        <h1 style={{fontFamily: "Times New Roman"}}>WELCOME</h1>
        <h6 style={{color: "rgba(255, 255, 255, 0.76)"}}>Start new Journey by joining in.</h6>
      </div>

      <div className={style.signInRegisterContainer}>
        <div className={style.signInRegisterWrapper}>

          <div className={style.switchButtons}>
            <button onClick={()=> setIsLoginToggle(true)}>Sign In</button>
            <button onClick={()=> setIsLoginToggle(false)}>Sign Up</button>
          </div>

          {isLoginToggle ? (
            <form
              onSubmit={handleLogin} //change to handleLogin later
              className={`${style.form} ${style.loginForm}`}>
              <h2>Sign In</h2>
              <input
                type="email"
                placeholder="Email"
                value={loginCredentials.email}
                onChange={(e)=>setLoginCredentials({...loginCredentials, email: e.target.value})}
                required />
              <input
                type="password"
                placeholder="Password"
                value={loginCredentials.password}
                onChange={(e)=>setLoginCredentials({...loginCredentials, password: e.target.value})}
                required />
              <button
                type="submit"
                disabled={loading}>
                  {loading ? "Loggin in..." : "Log in"}
              </button>
            </form>

          ) :(

            <form
            onSubmit={handleRegister}
              className={`${style.form} ${style.registerForm}`}>
              <h2>Sign Up</h2>
              <input
                type="text"
                placeholder="Full Name"
                value={signupCredentials.name}
                onChange={(e)=>setSignupCredentials({...signupCredentials, name: e.target.value})}
                required />
              <input
                type="email"
                placeholder="Email"
                value={signupCredentials.email}
                onChange={(e)=>setSignupCredentials({...signupCredentials, email: e.target.value})}
                required />
              <input
                type="password"
                placeholder="Password"
                value={signupCredentials.password}
                onChange={(e)=>setSignupCredentials({...signupCredentials, password: e.target.value})}
                required />
              
              <select
                value={signupCredentials.gender}
                onChange={(e)=>setSignupCredentials({...signupCredentials, gender: e.target.value})}>
                  <option value="" disabled>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
              </select>

              <input
                type="number"
                placeholder="Age"
                value={signupCredentials.age}
                onChange={(e)=>setSignupCredentials({...signupCredentials, age: e.target.value})}/>
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
