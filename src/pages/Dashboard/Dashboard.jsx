import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LogMedication from "./components/LogMedication/LogMedication";
import VitalSign from "./components/LogVitalSign/LogVitalSign";
import CurrentMedication from "./components/CurrentMedication/CurrentMedication";
import MedicationChart from "./components/MedicationChart/MedicationChart";
import VitalSignChart from "./components/VitalSignChart/VitalSignChart";
import "./Dashboard.css";
import { useAuth } from "../../AuthContext";
import {
  createMedicationRecord,
  getMyMedicationRecords,
  getMyMedications,
  getMyVitalSigns,
} from "../../api";

const DASHBOARD_FEATURES = [
  {
    key: "medication",
    badge: "LM",
    title: "Log New Medication",
    description: "Add a new medication with dosage, timing, and notes.",
  },
  {
    key: "current",
    badge: "CT",
    title: "Current Medication Tracker",
    description: "Review active medications, taken history, and Slack reminders.",
  },
  {
    key: "vital",
    badge: "LV",
    title: "Log Vital Sign",
    description: "Capture a new daily health reading in a few fields.",
  },
  {
    key: "medicationchart",
    badge: "MC",
    title: "Show Medication Chart",
    description: "See your actual taken history grouped by day and time of day.",
  },
  {
    key: "vitalSignChart",
    badge: "VC",
    title: "Show Vital Sign Chart",
    description: "Visualize heart rate, temperature, blood pressure, and blood sugar trends.",
  },
];

const Dashboard = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [openFeature, setOpenFeature] = useState(null);
  const [medicationRefreshKey, setMedicationRefreshKey] = useState(0);
  const [vitalRefreshKey, setVitalRefreshKey] = useState(0);
  const [dashboardMessage, setDashboardMessage] = useState("");
  const [dashboardStats, setDashboardStats] = useState({
    medicationCount: 0,
    takenCount: 0,
    vitalCount: 0,
    latestVitalDate: "",
  });
  const [dashboardData, setDashboardData] = useState({
    medications: [],
    medicationRecords: [],
    vitalSigns: [],
  });
  const [dashboardDataLoading, setDashboardDataLoading] = useState(true);
  const [dashboardDataError, setDashboardDataError] = useState({
    medications: "",
    medicationRecords: "",
    vitalSigns: "",
  });

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
    if (!currentUser?.id) {
      return;
    }

    let isMounted = true;

    async function loadDashboardStats() {
      setDashboardDataLoading(true);
      setDashboardDataError({
        medications: "",
        medicationRecords: "",
        vitalSigns: "",
      });

      try {
        const [medicationsResult, recordsResult, vitalsResult] = await Promise.allSettled([
          getMyMedications(),
          getMyMedicationRecords(),
          getMyVitalSigns(),
        ]);
        const medications = medicationsResult.status === "fulfilled" ? medicationsResult.value : [];
        const records = recordsResult.status === "fulfilled" ? recordsResult.value : [];
        const vitals = vitalsResult.status === "fulfilled" ? vitalsResult.value : [];

        if (!isMounted) {
          return;
        }

        setDashboardDataError({
          medications: medicationsResult.status === "rejected"
            ? medicationsResult.reason?.message || "Unable to load medications."
            : "",
          medicationRecords: recordsResult.status === "rejected"
            ? recordsResult.reason?.message || "Unable to load medication history."
            : "",
          vitalSigns: vitalsResult.status === "rejected"
            ? vitalsResult.reason?.message || "Unable to load vital signs."
            : "",
        });
        setDashboardData({
          medications,
          medicationRecords: records,
          vitalSigns: vitals,
        });
        setDashboardStats({
          medicationCount: medications.length,
          takenCount: records.length,
          vitalCount: vitals.length,
          latestVitalDate: vitals[0]?.date || "",
        });
      } finally {
        if (isMounted) {
          setDashboardDataLoading(false);
        }
      }
    }

    loadDashboardStats();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id, medicationRefreshKey, vitalRefreshKey]);

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

  const statLabelByFeature = {
    medication: "Create and save",
    current: `${dashboardStats.medicationCount} active meds`,
    vital: dashboardStats.latestVitalDate
      ? `Latest on ${dashboardStats.latestVitalDate}`
      : "Daily wellness log",
    medicationchart: `${dashboardStats.takenCount} taken records`,
    vitalSignChart: `${dashboardStats.vitalCount} vital entries`,
  };

  const renderFeatureContent = (featureKey) => {
    if (featureKey === "medication") {
      return <LogMedication onCreated={handleMedicationCreated} />;
    }

    if (featureKey === "current") {
      return (
        <CurrentMedication
          currentUser={currentUser}
          medications={dashboardData.medications}
          medicationRecords={dashboardData.medicationRecords}
          isLoading={dashboardDataLoading}
          loadError={dashboardDataError.medications || dashboardDataError.medicationRecords}
        />
      );
    }

    if (featureKey === "vital") {
      return <VitalSign onCreated={handleVitalCreated} />;
    }

    if (featureKey === "medicationchart") {
      return (
        <MedicationChart
          medications={dashboardData.medications}
          medicationRecords={dashboardData.medicationRecords}
          isLoading={dashboardDataLoading}
          error={dashboardDataError.medications || dashboardDataError.medicationRecords}
        />
      );
    }

    if (featureKey === "vitalSignChart") {
      return (
        <VitalSignChart
          vitalSigns={dashboardData.vitalSigns}
          isLoading={dashboardDataLoading}
          error={dashboardDataError.vitalSigns}
        />
      );
    }

    return null;
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Your Health Dashboard</h2>
      <p className="dashboard-subtitle">
        Signed in as {currentUser.name}, age {currentUser.age}
      </p>
      {dashboardMessage && <p className="dashboard-message">{dashboardMessage}</p>}

      <div className="dashboard-grid">
        {DASHBOARD_FEATURES.map((feature) => {
          const isOpen = openFeature === feature.key;

          return (
            <section
              key={feature.key}
              className={`dashboard-panel${isOpen ? " is-open" : ""}`}
            >
              <button
                className="dashboard-button"
                onClick={() => toggleFeature(feature.key)}
                aria-expanded={isOpen}
              >
                <span className="dashboard-button-badge">{feature.badge}</span>
                <span className="dashboard-button-copy">
                  <span className="dashboard-button-title">{feature.title}</span>
                  <span className="dashboard-button-description">{feature.description}</span>
                </span>
                <span className="dashboard-button-meta">
                  <span className="dashboard-button-stat">{statLabelByFeature[feature.key]}</span>
                  <span className="dashboard-button-arrow">{isOpen ? "−" : "+"}</span>
                </span>
              </button>
              <div className={`dashboard-content-shell${isOpen ? " is-open" : ""}`}>
                <div className="dashboard-content">
                  {isOpen ? renderFeatureContent(feature.key) : null}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
