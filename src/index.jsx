import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Link } from "react-router-dom"

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

function IndexPage() {
  return (
    <div className="container">
      <nav className="navbar">
        <div className="logo">MedTracker</div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/features">Features</Link></li>
          <li><a href="#openfda">openFDA</a></li>
          <li><a href="/about">About Us</a></li>
          <li><Link to="/login">Login</Link></li> 
        </ul>
      </nav>

      <header className="hero" id="home">
        <h1>Welcome to MedTracker</h1>
        <p>We care about your health.</p>
        <p>Stay on track with your medication, monitor your vitals, support yourself and your people.</p>
        <img src="/images/1.jpg" alt="MedTracker preview" className="hero-image" />
      </header>
    </div>
  );
}

export default IndexPage;