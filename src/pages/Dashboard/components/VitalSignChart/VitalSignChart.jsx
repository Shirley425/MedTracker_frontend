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
import { getMyVitalSigns } from "../../../../api";

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

const VitalTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="vital-tooltip">
      <p className="vital-tooltip-title">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey}>
          {entry.name}: {entry.value ?? "-"}
        </p>
      ))}
    </div>
  );
};

const VitalSignChart = ({
  vitalSigns: providedVitalSigns,
  isLoading: isExternalLoading = false,
  error: externalError = "",
  refreshKey = 0,
}) => {
  const [vitalSigns, setVitalSigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (providedVitalSigns) {
      setVitalSigns(providedVitalSigns);
      setIsLoading(isExternalLoading);
      setError(externalError);
      return;
    }

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
  }, [externalError, isExternalLoading, providedVitalSigns, refreshKey]);

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
      <p className="charts-subtitle">
        Track how your daily readings shift over time with a cleaner view for each metric.
      </p>

      <div className="chart-box">
        <h3>Heart Rate</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(25, 50, 74, 0.08)" strokeDasharray="4 4" />
            <XAxis dataKey="time" tick={{ fill: "#54708a", fontSize: 12 }} tickLine={false} />
            <YAxis tick={{ fill: "#54708a", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip content={<VitalTooltip />} />
            <Line type="monotone" dataKey="heartRate" name="Heart Rate" stroke="#1268b3" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-box">
        <h3>Body Temperature</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(25, 50, 74, 0.08)" strokeDasharray="4 4" />
            <XAxis dataKey="time" tick={{ fill: "#54708a", fontSize: 12 }} tickLine={false} />
            <YAxis tick={{ fill: "#54708a", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip content={<VitalTooltip />} />
            <Line type="monotone" dataKey="bodyTemperature" name="Body Temperature" stroke="#1ca58c" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-box">
        <h3>Blood Pressure</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(25, 50, 74, 0.08)" strokeDasharray="4 4" />
            <XAxis dataKey="time" tick={{ fill: "#54708a", fontSize: 12 }} tickLine={false} />
            <YAxis tick={{ fill: "#54708a", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip content={<VitalTooltip />} />
            <Line type="monotone" dataKey="bloodPressure" name="Blood Pressure" stroke="#ea8c2f" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-box">
        <h3>Blood Sugar</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(25, 50, 74, 0.08)" strokeDasharray="4 4" />
            <XAxis dataKey="time" tick={{ fill: "#54708a", fontSize: 12 }} tickLine={false} />
            <YAxis tick={{ fill: "#54708a", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip content={<VitalTooltip />} />
            <Line type="monotone" dataKey="bloodSugar" name="Blood Sugar" stroke="#de5f74" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


export default VitalSignChart;
