import React, { useState } from 'react';
import LogMedication from './logMedication';
import VitalSign from './logVitalSign';
import './features.css';
import VitalSignChart from './vitalSignChart';
import MedicationChart from './medicationChart';

const Features = () => {
  const [openFeature, setOpenFeature] = useState(null);

  const toggleFeature = (featureName) => {
    setOpenFeature(openFeature === featureName ? null : featureName);
  };

  const data1 = [
  { medication: "Aspirin", date: "2025-08-01", status: "taken" },
  { medication: "Aspirin", date: "2025-08-02", status: "skipped" },
  { medication: "Ibuprofen", date: "2025-08-01", status: "taken" },
];

  

  return (
    <div className="features-container">
      <h2 className="features-title">Features</h2>

      <div className="feature-block">
        <button
          className="feature-button"
          onClick={() => toggleFeature('medication')}
        >
          Log Medication
        </button>
        {openFeature === 'medication' && (
          <div className="feature-content">
            <LogMedication />
          </div>
        )}
      </div>

      <div className="feature-block">
        <button
          className="feature-button"
          onClick={() => toggleFeature('vital')}
        >
          Log Vital Sign
        </button>
        {openFeature === 'vital' && (
          <div className="feature-content">
            <VitalSign />
          </div>
        )}
      </div>

      <div className="feature-block">
        <button
          className="feature-button"
          onClick={() => toggleFeature('medicationchart')}
        >
          Show Medication Chart
        </button>
        {openFeature === 'medicationchart' && (
          <div className="feature-content">
            <MedicationChart />
          </div>
        )}
      </div>

      <div className="feature-block">
        <button
          className="feature-button"
          onClick={() => toggleFeature('vitalSignChart')}
        >
          Show Vital Sign Chart
        </button>
        {openFeature === 'vitalSignChart' && (
          <div className="feature-content">
            <VitalSignChart />
          </div>
        )}
      </div>
    </div>
  );
};

export default Features;
