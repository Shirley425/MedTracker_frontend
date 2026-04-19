import React from "react";
import { render, screen } from "@testing-library/react";
import VitalSignChart from "./VitalSignChart";

jest.mock("../api", () => ({
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

const { getMyVitalSigns } = require("../api");

describe("VitalSignChart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
