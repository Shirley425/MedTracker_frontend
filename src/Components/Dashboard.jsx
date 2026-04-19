import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LogMedication from "./LogMedication";
import VitalSign from "./LogVitalSign";
import CurrentMedication from "./CurrentMedication";
import MedicationChart from "./MedicationChart";
import VitalSignChart from "./VitalSignChart";
import "./Dashboard.css";
import { useAuth } from "../AuthContext";
import { createMedicationRecord } from "../api";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [openFeature, setOpenFeature] = useState(null);
  const [medicationRefreshKey, setMedicationRefreshKey] = useState(0);
  const [vitalRefreshKey, setVitalRefreshKey] = useState(0);
  const [dashboardMessage, setDashboardMessage] = useState("");

  const toggleFeature = (featureName) => {
    setOpenFeature(openFeature === featureName ? null : featureName);
  };

  const handleMedicationCreated = () => {
    setMedicationRefreshKey((current) => current + 1);
  };

  const handleVitalCreated = () => {
    setVitalRefreshKey((current) => current + 1);
  };

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const params = new URLSearchParams(location.search);
    const action = params.get("action");
    const medicationId = params.get("medicationId");

    if (action !== "taken" || !medicationId) {
      return;
    }

    let isMounted = true;

    async function recordTakenFromSlack() {
      try {
        await createMedicationRecord({
          medication_id: Number(medicationId),
          source: "SLACK",
        });

        if (isMounted) {
          setMedicationRefreshKey((current) => current + 1);
          setDashboardMessage("Medication recorded as taken from Slack.");
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        if (isMounted) {
          setDashboardMessage("Unable to record the Slack medication action.");
          navigate("/dashboard", { replace: true });
        }
      }
    }

    recordTakenFromSlack();

    return () => {
      isMounted = false;
    };
  }, [currentUser, location.search, navigate]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Your Health Dashboard</h2>
      <p className="dashboard-subtitle">
        Signed in as {currentUser.name}, age {currentUser.age}
      </p>
      {dashboardMessage && <p className="dashboard-message">{dashboardMessage}</p>}

      <div className="dashboard-block">
        <button
          className="dashboard-button"
          onClick={() => toggleFeature("medication")}
        >
          Log New Medication
        </button>
        {openFeature === "medication" && (
          <div className="dashboard-content">
            <LogMedication onCreated={handleMedicationCreated} />
          </div>
        )}
      </div>

      <div className="dashboard-block">
        <button
          className="dashboard-button"
          onClick={() => toggleFeature("current")}
        >
          Current Medication Tracker
        </button>
        {openFeature === "current" && (
          <div className="dashboard-content">
            <CurrentMedication
              currentUser={currentUser}
              refreshKey={medicationRefreshKey}
            />
          </div>
        )}
      </div>

      <div className="dashboard-block">
        <button
          className="dashboard-button"
          onClick={() => toggleFeature("vital")}
        >
          Log Vital Sign
        </button>
        {openFeature === "vital" && (
          <div className="dashboard-content">
            <VitalSign onCreated={handleVitalCreated} />
          </div>
        )}
      </div>

      <div className="dashboard-block">
        <button
          className="dashboard-button"
          onClick={() => toggleFeature("medicationchart")}
        >
          Show Medication Chart
        </button>
        {openFeature === "medicationchart" && (
          <div className="dashboard-content">
            <MedicationChart refreshKey={medicationRefreshKey} />
          </div>
        )}
      </div>

      <div className="dashboard-block">
        <button
          className="dashboard-button"
          onClick={() => toggleFeature("vitalSignChart")}
        >
          Show Vital Sign Chart
        </button>
        {openFeature === "vitalSignChart" && (
          <div className="dashboard-content">
            <VitalSignChart refreshKey={vitalRefreshKey} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
