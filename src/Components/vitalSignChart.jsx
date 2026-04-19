import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./VitalSignChart.css";
import { getMyVitalSigns } from "../api";

const formatDateLabel = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
  });
};

const readBloodPressureValue = (value) => {
  if (value === null || value === undefined) {
    return null;
  }
  return Number(value) || null;
};

const VitalSignChart = ({ refreshKey = 0 }) => {
  const [vitalSigns, setVitalSigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadVitalSigns() {
      setIsLoading(true);
      setError("");

      try {
        const items = await getMyVitalSigns();
        if (isMounted) {
          setVitalSigns(items);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Unable to load vital signs.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadVitalSigns();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const data = [...vitalSigns]
    .reverse()
    .map((entry, index) => ({
      id: entry.id ?? index,
      time: formatDateLabel(entry.date),
      heartRate: Number(entry.heart_rate) || null,
      bodyTemperature: Number(entry.body_temperature) || null,
      bloodPressure: readBloodPressureValue(entry.blood_pressure_systolic),
      bloodSugar: Number(entry.blood_sugar) || null,
    }));

  if (isLoading) {
    return <div className="charts-container">Loading vital sign charts...</div>;
  }

  if (error) {
    return <div className="charts-container">Error: {error}</div>;
  }

  if (data.length === 0) {
    return <div className="charts-container">No vital sign data available yet.</div>;
  }

  return (
    <div className="charts-container">
      <h2>Vital Signs Over Time</h2>

      <div className="chart-box">
        <h3>Heart Rate</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="heartRate" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-box">
        <h3>Body Temperature</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="bodyTemperature" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-box">
        <h3>Blood Pressure</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="bloodPressure" stroke="#ff7300" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-box">
        <h3>Blood Sugar</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="bloodSugar" stroke="#ff4d4f" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


export default VitalSignChart;
