import React, { useState } from "react";
import "./LogMedication.css";
import { createMedication } from "../api";

const INITIAL_FORM_DATA = {
  name: "",
  dosage: "",
  frequency: "",
  start_date: "",
  end_date: "",
  note: "",
};

const LogMedication = ({ onCreated }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      await createMedication({
        ...formData,
      });
      setFormData(INITIAL_FORM_DATA);
      setMessage("Medication saved to the backend.");
      onCreated?.();
    } catch (submitError) {
      setError(submitError.message || "Unable to save medication.");
    } finally {
      setIsSubmitting(false);
    }
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
          {isSubmitting ? "Saving..." : "Save"}
        </button>

        {message && <p className='form-message success'>{message}</p>}
        {error && <p className='form-message error'>{error}</p>}
      </form>
    </div>
  );
}

export default LogMedication;
