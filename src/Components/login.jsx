import React, { useState } from "react";
import "./login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password, role });

    // TODO: Call backend login API
  };

  return (
    <div className='login-container'>
      <form className='login-form' onSubmit={handleSubmit}>
        <h2>Login to MedTracker</h2>

        <div className='role-tabs'>
          <button
            type='button'
            className={role === "patient" ? "active" : ""}
            onClick={() => setRole("patient")}
          >
            Patient
          </button>
          <button
            type='button'
            className={role === "caregiver" ? "active" : ""}
            onClick={() => setRole("caregiver")}
          >
            Caregiver
          </button>
        </div>

        <label>Email / Username</label>
        <input
          type='text'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type='submit' className='login-button'>
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;