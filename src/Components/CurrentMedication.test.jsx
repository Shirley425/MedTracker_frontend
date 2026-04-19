import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CurrentMedication from "./CurrentMedication";

const mockUpdateCurrentUser = jest.fn();

jest.mock("../AuthContext", () => ({
  useAuth: () => ({
    updateCurrentUser: mockUpdateCurrentUser,
  }),
}));

jest.mock("../api", () => ({
  createMedicationRecord: jest.fn(),
  getMyMedicationRecords: jest.fn(),
  getMyMedications: jest.fn(),
  sendMedicationSlackReminder: jest.fn(),
  updateMedicationSlackNotifications: jest.fn(),
  updateMySlackConnection: jest.fn(),
}));

const {
  createMedicationRecord,
  getMyMedicationRecords,
  getMyMedications,
  updateMySlackConnection,
} = require("../api");

describe("CurrentMedication", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      {
        id: 1,
        medication_id: 10,
        taken_at: "2026-04-19T10:00:00",
      },
    ]);
  });

  it("updates taken counts when the Taken button is pressed", async () => {
    createMedicationRecord.mockResolvedValue({
      id: 2,
      medication_id: 10,
      taken_at: "2026-04-19T12:00:00",
      status: "TAKEN",
      source: "MANUAL",
    });

    render(
        <CurrentMedication
          currentUser={{ id: 1, slack_connected: false, slack_member_id: null }}
          refreshKey={0}
      />
    );

    expect(await screen.findByText("Ibuprofen")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Taken" }));

    expect(createMedicationRecord).toHaveBeenCalledWith({
      medication_id: 10,
      source: "MANUAL",
    });

    expect(await screen.findByText("2")).toBeInTheDocument();
  });

  it("links a Slack member ID for the current user", async () => {
    updateMySlackConnection.mockResolvedValue({
      id: 1,
      name: "Joe Doe",
      slack_connected: true,
      slack_member_id: "U12345678",
    });

    render(
      <CurrentMedication
        currentUser={{ id: 1, slack_connected: false, slack_member_id: null }}
        refreshKey={0}
      />
    );

    await screen.findByText("Ibuprofen");
    await userEvent.type(
      screen.getByPlaceholderText(/enter your slack member id/i),
      "U12345678"
    );
    await userEvent.click(screen.getByRole("button", { name: /link slack app/i }));

    expect(updateMySlackConnection).toHaveBeenCalledWith("U12345678");
    await waitFor(() =>
      expect(mockUpdateCurrentUser).toHaveBeenCalledWith(
        expect.objectContaining({ slack_member_id: "U12345678" })
      )
    );
  });
});
