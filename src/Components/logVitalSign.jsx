import React, { useState } from 'react';
import './logVitalSign.css';

const VitalSign = () => {
  const [formData, setFormData] = useState({
    heartRate: '',
    bodyTemperature: '',
    bloodPressure: '',
    bloodSugar: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/vitalsigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Vital signs logged successfully!');
        setFormData({
          heartRate: '',
          bodyTemperature: '',
          bloodPressure: '',
          bloodSugar: ''
        });
      } else {
        alert('Error logging vital signs.');
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <form className="vital-sign-form" onSubmit={handleSubmit}>
      <h2>Log Vital Signs</h2>

      <label>
        Heart Rate (bpm):
        <input
          type="number"
          name="heartRate"
          value={formData.heartRate}
          onChange={handleChange}
        />
      </label>

      <label>
        Body Temperature (°C):
        <input
          type="number"
          step="0.1"
          name="bodyTemperature"
          value={formData.bodyTemperature}
          onChange={handleChange}
        />
      </label>

      <label>
        Blood Pressure (e.g. 120/80):
        <input
          type="text"
          name="bloodPressure"
          value={formData.bloodPressure}
          onChange={handleChange}
        />
      </label>

      <label>
        Blood Sugar (mg/dL):
        <input
          type="number"
          name="bloodSugar"
          value={formData.bloodSugar}
          onChange={handleChange}
        />
      </label>

      <button type="submit">Submit</button>
    </form>
  );
};

export default VitalSign;
