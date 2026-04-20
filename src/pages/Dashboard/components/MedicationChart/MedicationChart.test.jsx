import React from "react";
import { render, screen } from "@testing-library/react";
import MedicationChart from "./MedicationChart";

jest.mock("../../../../api", () => ({
  getMyMedicationRecords: jest.fn(),
  getMyMedications: jest.fn(),
}));

jest.mock("recharts", () => {
  const React = require("react");
  const Mock = ({ children }) => <div>{children}</div>;
  return {
    ResponsiveContainer: Mock,
    ScatterChart: Mock,
    Scatter: () => <div>Scatter Plot</div>,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
  };
});

const { getMyMedicationRecords, getMyMedications } = require("../../../../api");

describe("MedicationChart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders grouped medication history from dashboard props without refetching", async () => {
    render(
      <MedicationChart
        medications={[
          { id: 10, name: "Ibuprofen", frequency: "Twice daily" },
        ]}
        medicationRecords={[
          { id: 1, medication_id: 10, taken_at: "2026-04-19T08:15:00" },
          { id: 2, medication_id: 10, taken_at: "2026-04-19T19:45:00" },
        ]}
      />
    );

    expect(await screen.findByText("Ibuprofen")).toBeInTheDocument();
    expect(screen.getByText(/twice daily/i)).toBeInTheDocument();
    expect(screen.getByText(/2 taken records/i)).toBeInTheDocument();
    expect(getMyMedications).not.toHaveBeenCalled();
    expect(getMyMedicationRecords).not.toHaveBeenCalled();
  });

  it("renders an empty state when there are no taken records", async () => {
    getMyMedications.mockResolvedValue([{ id: 10, name: "Ibuprofen", frequency: "Twice daily" }]);
    getMyMedicationRecords.mockResolvedValue([]);

    render(<MedicationChart refreshKey={0} />);

    expect(await screen.findByText("No taken medication records yet.")).toBeInTheDocument();
  });

  it("renders an API error state", async () => {
    getMyMedications.mockRejectedValue(new Error("Medication history unavailable"));
    getMyMedicationRecords.mockRejectedValue(new Error("Medication history unavailable"));

    render(<MedicationChart refreshKey={0} />);

    expect(await screen.findByText("Error: Medication history unavailable")).toBeInTheDocument();
  });
});
