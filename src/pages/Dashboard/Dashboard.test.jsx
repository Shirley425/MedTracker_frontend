import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "./Dashboard";

const mockNavigate = jest.fn();
const mockLocation = { search: "" };

jest.mock(
  "react-router-dom",
  () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  }),
  { virtual: true }
);

jest.mock("../../AuthContext", () => ({
  useAuth: () => ({
    currentUser: { id: 1, name: "Joe Doe", age: 31 },
  }),
}));

jest.mock("../../api", () => ({
  createMedicationRecord: jest.fn(),
  getMyMedicationRecords: jest.fn(),
  getMyMedications: jest.fn(),
  getMyVitalSigns: jest.fn(),
  sendMedicationSlackReminder: jest.fn(),
  updateMedicationSlackNotifications: jest.fn(),
  updateMySlackConnection: jest.fn(),
  createMedication: jest.fn(),
  createVitalSign: jest.fn(),
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
    LineChart: Mock,
    Line: () => <div>Line Plot</div>,
    CartesianGrid: () => null,
  };
});

const {
  createMedicationRecord,
  getMyMedicationRecords,
  getMyMedications,
  getMyVitalSigns,
} = require("../../api");

describe("Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.search = "";
    getMyMedications.mockResolvedValue([
      {
        id: 10,
        name: "Ibuprofen",
        dosage: "200mg",
        frequency: "Twice daily",
        start_date: "2026-04-19",
        end_date: "2026-04-25",
        slack_notifications_enabled: false,
      },
    ]);
    getMyMedicationRecords.mockResolvedValue([
      { id: 1, medication_id: 10, taken_at: "2026-04-19T10:00:00" },
      { id: 2, medication_id: 10, taken_at: "2026-04-19T20:00:00" },
    ]);
    getMyVitalSigns.mockResolvedValue([
      {
        id: 1,
        date: "2026-04-19",
        heart_rate: 72,
        body_temperature: 36.8,
        blood_pressure_systolic: 118,
        blood_sugar: 96,
      },
    ]);
  });

  it("expands modules and loads tracker/chart data", async () => {
    render(<Dashboard />);

    await userEvent.click(screen.getByRole("button", { name: /current medication tracker/i }));
    expect(await screen.findByText("Ibuprofen")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /show medication chart/i }));
    expect(await screen.findByText(/twice daily/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /show vital sign chart/i }));
    expect(await screen.findByText("Vital Signs Over Time")).toBeInTheDocument();
  });

  it("reuses centralized dashboard data instead of refetching on panel open", async () => {
    render(<Dashboard />);

    expect(await screen.findByText(/1 active meds/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /current medication tracker/i }));
    expect(await screen.findByText("Ibuprofen")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /show medication chart/i }));
    expect(await screen.findAllByText(/2 taken records/i)).toHaveLength(2);

    await userEvent.click(screen.getByRole("button", { name: /show vital sign chart/i }));
    expect(await screen.findByText("Vital Signs Over Time")).toBeInTheDocument();

    expect(getMyMedications).toHaveBeenCalledTimes(1);
    expect(getMyMedicationRecords).toHaveBeenCalledTimes(1);
    expect(getMyVitalSigns).toHaveBeenCalledTimes(1);
  });

  it("shows a dashboard message when Slack taken action succeeds", async () => {
    mockLocation.search = "?action=taken&medicationId=10";
    createMedicationRecord.mockResolvedValue({ id: 99 });

    render(<Dashboard />);

    expect(await screen.findByText("Medication recorded as taken from Slack.")).toBeInTheDocument();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true }));
  });

  it("shows tracker and chart error states when API calls fail", async () => {
    getMyMedications.mockRejectedValue(new Error("Medication API down"));
    getMyMedicationRecords.mockRejectedValue(new Error("Medication API down"));
    getMyVitalSigns.mockRejectedValue(new Error("Vitals API down"));

    render(<Dashboard />);

    await userEvent.click(screen.getByRole("button", { name: /current medication tracker/i }));
    expect(await screen.findByText("Error: Medication API down")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /show vital sign chart/i }));
    expect(await screen.findByText("Error: Vitals API down")).toBeInTheDocument();
  });
});
