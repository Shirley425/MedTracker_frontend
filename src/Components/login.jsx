import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Login.css";
import { loginUser } from "../api";
import { useAuth } from "../AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTarget = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (currentUser) {
      navigate(redirectTarget, { replace: true });
    }
  }, [currentUser, navigate, redirectTarget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const session = await loginUser({
        email: email.trim(),
        password,
      });
      login(session);
      navigate(redirectTarget, { replace: true });
    } catch (loginError) {
      setError(loginError.message || "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='login-container'>
      <form className='login-form' onSubmit={handleSubmit}>
        <h2>User Login</h2>
        <p className='login-subtitle'>Sign in to view your medications and vitals.</p>

        <label>Email</label>
        <input
          type='email'
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
          {isSubmitting ? "Signing In..." : "Login"}
        </button>

        {error && <p className='login-error'>{error}</p>}
      </form>
    </div>
  );
}

export default Login;
