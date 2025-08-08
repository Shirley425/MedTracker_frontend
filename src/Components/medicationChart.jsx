import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import './medicationChart.css';

  const data1 = [
  { medication: "Aspirin", date: "2025-08-01", status: "taken" },
  { medication: "Aspirin", date: "2025-08-02", status: "skipped" },
  { medication: "Ibuprofen", date: "2025-08-01", status: "taken" },
];

const MedicationChart = ({ data = [data1] }) => {
  const medicationGroups = data.reduce((acc, entry) => {
    if (!acc[entry.medication]) acc[entry.medication] = [];
    acc[entry.medication].push({
      date: entry.date,
      value: 1,
      status: entry.status,
    });
    return acc;
  }, {});

  return (
    <div className="medication-chart-container">
      {Object.entries(medicationGroups).map(([medication, points]) => (
        <div key={medication} className="medication-chart">
          <h3>{medication}</h3>
          <ResponsiveContainer width="100%" height={150}>
            <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" type="category" />
              <YAxis dataKey="value" type="number" hide domain={[0.9, 1.1]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter
                name="Taken"
                data={points.filter(p => p.status === 'taken')}
                fill="green"
                shape="circle"
              />
              <Scatter
                name="Skipped"
                data={points.filter(p => p.status === 'skipped')}
                fill="red"
                shape="cross"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
};

export default MedicationChart;
