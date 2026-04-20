import React from "react";
import { render, screen } from "@testing-library/react";
import VitalSignChart from "./VitalSignChart";

jest.mock("../../../../api", () => ({
  getMyVitalSigns: jest.fn(),
}));

jest.mock("recharts", () => {
  const React = require("react");
  const Mock = ({ children }) => <div>{children}</div>;
  return {
    ResponsiveContainer: Mock,
    LineChart: Mock,
    Line: () => <div>Line Plot</div>,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
  };
});

const { getMyVitalSigns } = require("../../../../api");

describe("VitalSignChart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders vital sign charts from dashboard props without refetching", async () => {
    render(
      <VitalSignChart
        vitalSigns={[
          {
            id: 1,
            date: "2026-04-19",
            heart_rate: 72,
            body_temperature: 36.7,
            blood_pressure_systolic: 118,
            blood_sugar: 96,
          },
        ]}
      />
    );

    expect(await screen.findByText("Vital Signs Over Time")).toBeInTheDocument();
    expect(screen.getByText("Heart Rate")).toBeInTheDocument();
    expect(screen.getByText("Blood Sugar")).toBeInTheDocument();
    expect(getMyVitalSigns).not.toHaveBeenCalled();
  });

  it("renders an empty state when there is no data", async () => {
    getMyVitalSigns.mockResolvedValue([]);

    render(<VitalSignChart refreshKey={0} />);

    expect(await screen.findByText("No vital sign data available yet.")).toBeInTheDocument();
  });

  it("renders an error state when the API fails", async () => {
    getMyVitalSigns.mockRejectedValue(new Error("Vitals unavailable"));

    render(<VitalSignChart refreshKey={0} />);

    expect(await screen.findByText("Error: Vitals unavailable")).toBeInTheDocument();
  });
});
