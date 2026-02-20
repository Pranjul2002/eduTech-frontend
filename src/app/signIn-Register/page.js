"use client";

import React, { useState } from "react";
import "./siginRegisterStyle.css";

const Page = () => {

  const [isLoginToggle, setIsLoginToggle]=useState(true);

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

  return (
    <div className="signInRegister">
      <div className="signInRegisterHero">
        <h1 style={{fontFamily: "Times New Roman"}}>WELCOME</h1>
        <h6 style={{color: "rgba(255, 255, 255, 0.76)"}}>Start new Journey by joining in.</h6>
      </div>

      <div className="signInRegisterContainer">
        <div className="signInRegisterWrapper">

          <div className="switchButtons">
            <button onClick={()=> setIsLoginToggle(true)}>Sign In</button>
            <button onClick={()=> setIsLoginToggle(false)}>Sign Up</button>
          </div>

          {isLoginToggle ? (
            <form className="form login-form">
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
              <button type="submit">Login</button>
            </form>

          ) :(

            <form className="form register-form">
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
                <option value="option1">Male</option>
                <option value="option2">Female</option>
                <option value="option3">Other</option>
              </select>

              <input
                placeholder="Age"
                value={signupCredentials.age}
                onChange={(e)=>setSignupCredentials({...signupCredentials, age: e.target.value})}/>
              <button
                type="submit"
                onClick={console.log(signupCredentials)}
                >
                  Register
              </button>
            </form>

          )}

        </div>
      </div>
    </div>
  );
};

export default Page;