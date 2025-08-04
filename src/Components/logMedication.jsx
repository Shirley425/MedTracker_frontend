import React, { useState } from "react";
import "./logMedication.css";

export default function LogMedication() {
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    start_date: "",
    end_date: "",
    note: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting medication:", formData);

    fetch("http://localhost:8080/api/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
  };

  return (
    <div className='med-log-container'>
      <form className='med-log-form' onSubmit={handleSubmit}>
        <h2>Log New Medication</h2>

        <label>Medication Name</label>
        <input
          type='text'
          name='name'
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label>Dosage</label>
        <input
          type='text'
          name='dosage'
          value={formData.dosage}
          onChange={handleChange}
        />

        <label>Frequency</label>
        <input
          type='text'
          name='frequency'
          value={formData.frequency}
          onChange={handleChange}
        />

        <label>Start Date</label>
        <input
          type='date'
          name='start_date'
          value={formData.start_date}
          onChange={handleChange}
        />

        <label>End Date</label>
        <input
          type='date'
          name='end_date'
          value={formData.end_date}
          onChange={handleChange}
        />

        <label>Note</label>
        <textarea
          name='note'
          value={formData.note}
          onChange={handleChange}
          rows='3'
        />

        <button type='submit' className='submit-button'>
          Save
        </button>
      </form>
    </div>
  );
}
