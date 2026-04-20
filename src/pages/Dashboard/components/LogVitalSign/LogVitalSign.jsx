import React, { useState } from "react";
import "./LogVitalSign.css";
import { createVitalSign } from "../../../../api";

const INITIAL_FORM_DATA = {
  date: new Date().toISOString().slice(0, 10),
  heart_rate: "",
  body_temperature: "",
  blood_pressure_systolic: "",
  blood_pressure_diastolic: "",
  blood_sugar: "",
};

const VitalSign = ({ onCreated }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      await createVitalSign({
        ...formData,
      });
      setFormData({
        ...INITIAL_FORM_DATA,
        date: new Date().toISOString().slice(0, 10),
      });
      setMessage("Vital signs saved to the backend.");
      onCreated?.();
    } catch (submitError) {
      setError(submitError.message || "Unable to save vital signs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="vital-sign-form" onSubmit={handleSubmit}>
      <h2>Log Vital Signs</h2>

      <label>
        Date:
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Heart Rate (bpm):
        <input
          type="number"
          name="heart_rate"
          value={formData.heart_rate}
          onChange={handleChange}
        />
      </label>

      <label>
        Body Temperature (°C):
        <input
          type="number"
          step="0.1"
          name="body_temperature"
          value={formData.body_temperature}
          onChange={handleChange}
        />
      </label>

      <label>
        Blood Pressure Systolic (mmHg):
        <input
          type="number"
          name="blood_pressure_systolic"
          value={formData.blood_pressure_systolic}
          onChange={handleChange}
        />
      </label>

      <label>
        Blood Pressure Diastolic (mmHg):
        <input
          type="number"
          name="blood_pressure_diastolic"
          value={formData.blood_pressure_diastolic}
          onChange={handleChange}
        />
      </label>

      <label>
        Blood Sugar (mg/dL):
        <input
          type="number"
          name="blood_sugar"
          value={formData.blood_sugar}
          onChange={handleChange}
        />
      </label>

      <button type="submit">{isSubmitting ? "Saving..." : "Submit"}</button>
      {message && <p className="form-message success">{message}</p>}
      {error && <p className="form-message error">{error}</p>}
    </form>
  );
};

export default VitalSign;
