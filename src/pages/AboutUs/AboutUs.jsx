import React from "react";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <h1>About Us</h1>
      <p className="about-description">
        MedTracker is dedicated to helping patients manage
        medications and vital signs with ease. Our mission is to promote
        healthier lives through technology.
      </p>
      <img
        src="/images/3.png"
        alt="Our Team"
        className="about-image"
      />

      <h2>Contact Us</h2>
      <form className="contact-form">
        <label>
          Name:
          <input type="text" name="name" placeholder="Your name" required />
        </label>

        <label>
          Email:
          <input type="email" name="email" placeholder="Your email" required />
        </label>

        <label>
          Phone:
          <input type="tel" name="phone" placeholder="Your phone number" />
        </label>

        <label>
          Message:
          <textarea name="message" rows="5" placeholder="Your message..." required />
        </label>

        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default AboutUs;
