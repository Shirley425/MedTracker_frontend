import React from "react";
import "./Features.css";

const featureCards = [
  {
    title: "Medication Tracking",
    description:
      "Keep a clear record of current medications, dosage plans, start and end dates, and important notes for each treatment.",
  },
  {
    title: "Vital Sign Logging",
    description:
      "Capture daily health readings such as heart rate, body temperature, blood pressure, and blood sugar in one place.",
  },
  {
    title: "Progress Charts",
    description:
      "Visualize medication schedules and vital sign trends over time so changes are easier to understand at a glance.",
  },
  {
    title: "Personalized View",
    description:
      "Each signed-in user sees their own health information, helping keep records private and organized by account.",
  },
  {
    title: "Medication Lookup",
    description:
      "Search public medication information through OpenFDA to quickly review indications and possible adverse reactions.",
  },
  {
    title: "Care Support Workflow",
    description:
      "Designed to help users and caregivers stay aligned with routines, observations, and treatment history.",
  },
];

const Features = () => {
  return (
    <div className="features-container">
      <div className="features-hero">
        <p className="features-kicker">Feature Overview</p>
        <h2 className="features-title">What MedTracker Helps You Do</h2>
        <p className="features-subtitle">
          A simple health-tracking workspace for everyday medication and wellness routines.
        </p>
        <p className="features-description">
          MedTracker helps people keep medication schedules, record vital signs,
          review trend charts, and look up drug information in one place.
          After signing in, each user sees only their own data.
        </p>
      </div>

      <div className="features-grid">
        {featureCards.map((card) => (
          <article key={card.title} className="feature-card">
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Features;
