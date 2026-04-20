import React from "react";
import "./HomePage.css";


function HomePage() {
  return (
      <header className="hero" id="home">
        <h1>Welcome to MedTracker</h1>
        <p>We care about your health.</p>
        <p>Stay on track with your medication, monitor your vitals, support yourself and your people.</p>
        <img src="/images/1.jpg" alt="MedTracker preview" className="hero-image" />
      </header>
  );
}

export default HomePage;