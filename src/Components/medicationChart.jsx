import React, { useEffect, useState } from "react";
import "./MedicationChart.css";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  getMedicationRecordsByUserId,
  getMedicationsByUserId,
} from "../api";

const getTimeSlot = (value) => {
  const hour = new Date(value).getHours();

  if (hour < 11) {
    return { label: "Morning", value: 1 };
  }

  if (hour < 16) {
    return { label: "Afternoon", value: 2 };
  }

  if (hour < 21) {
    return { label: "Evening", value: 3 };
  }

  return { label: "Night", value: 4 };
};

const formatDateLabel = (value) => {
  return new Date(value).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
  });
};

const MedicationTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="medication-tooltip">
      <p>{point.fullDate}</p>
      <p>{point.slot}</p>
      <p>{point.takenCount} record{point.takenCount > 1 ? "s" : ""}</p>
    </div>
  );
};

const MedicationChart = ({ userId = 1, refreshKey = 0 }) => {
  const [medicationGroups, setMedicationGroups] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadMedicationChart() {
      setIsLoading(true);
      setError("");

      try {
        const [medications, records] = await Promise.all([
          getMedicationsByUserId(userId),
          getMedicationRecordsByUserId(userId),
        ]);

        if (!isMounted) {
          return;
        }

        const medicationMap = medications.reduce((acc, medication) => {
          acc[medication.id] = medication;
          return acc;
        }, {});

        const groups = records.reduce((acc, record) => {
          const medication = medicationMap[record.medication_id];

          if (!medication) {
            return acc;
          }

          const medicationName = medication.name;
          const slot = getTimeSlot(record.taken_at);
          const bucketKey = `${record.medication_id}-${record.taken_at.slice(0, 10)}-${slot.label}`;

          if (!acc[medicationName]) {
            acc[medicationName] = {
              frequency: medication.frequency,
              totalTaken: 0,
              pointsMap: {},
            };
          }

          if (!acc[medicationName].pointsMap[bucketKey]) {
            acc[medicationName].pointsMap[bucketKey] = {
              date: formatDateLabel(record.taken_at),
              fullDate: new Date(record.taken_at).toLocaleString("en-US", {
                month: "2-digit",
                day: "2-digit",
                hour: "numeric",
                minute: "2-digit",
              }),
              slot: slot.label,
              value: slot.value,
              takenCount: 0,
            };
          }

          acc[medicationName].pointsMap[bucketKey].takenCount += 1;
          acc[medicationName].totalTaken += 1;

          return acc;
        }, {});

        const normalizedGroups = Object.fromEntries(
          Object.entries(groups).map(([name, group]) => [
            name,
            {
              frequency: group.frequency,
              totalTaken: group.totalTaken,
              points: Object.values(group.pointsMap).sort(
                (left, right) => new Date(left.fullDate) - new Date(right.fullDate)
              ),
            },
          ])
        );

        setMedicationGroups(normalizedGroups);
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Unable to load medication history.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMedicationChart();

    return () => {
      isMounted = false;
    };
  }, [refreshKey, userId]);

  if (isLoading) {
    return <div className="medication-chart-container">Loading medication chart...</div>;
  }

  if (error) {
    return <div className="medication-chart-container">Error: {error}</div>;
  }

  if (Object.keys(medicationGroups).length === 0) {
    return <div className="medication-chart-container">No taken medication records yet.</div>;
  }

  return (
    <div className="medication-chart-container">
      {Object.entries(medicationGroups).map(([medication, group]) => (
        <div key={medication} className="medication-chart">
          <h3>{medication}</h3>
          <p className="medication-chart-frequency">
            {group.frequency} • {group.totalTaken} taken record{group.totalTaken > 1 ? "s" : ""}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 16 }}>
              <XAxis
                dataKey="date"
                type="category"
                interval={0}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis
                dataKey="value"
                type="number"
                allowDecimals={false}
                domain={[0.5, 4.5]}
                ticks={[1, 2, 3, 4]}
                tickFormatter={(value) =>
                  ({ 1: "Morning", 2: "Afternoon", 3: "Evening", 4: "Night" }[value] || "")
                }
              />
              <Tooltip content={<MedicationTooltip />} />
              <Scatter name="Taken history" data={group.points} fill="#1976d2" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
};

export default MedicationChart;
