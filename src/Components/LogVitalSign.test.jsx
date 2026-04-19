import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VitalSign from "./LogVitalSign";

jest.mock("../api", () => ({
  createVitalSign: jest.fn(),
}));

const { createVitalSign } = require("../api");

describe("LogVitalSign", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createVitalSign.mockResolvedValue({ id: 1 });
  });

  it("submits normalized vital sign fields including systolic and diastolic pressure", async () => {
    render(<VitalSign onCreated={jest.fn()} />);

    await userEvent.clear(screen.getByLabelText(/heart rate/i));
    await userEvent.type(screen.getByLabelText(/heart rate/i), "72");
    await userEvent.clear(screen.getByLabelText(/body temperature/i));
    await userEvent.type(screen.getByLabelText(/body temperature/i), "36.8");
    await userEvent.type(screen.getByLabelText(/blood pressure systolic/i), "118");
    await userEvent.type(screen.getByLabelText(/blood pressure diastolic/i), "76");
    await userEvent.type(screen.getByLabelText(/blood sugar/i), "96");

    await userEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() =>
      expect(createVitalSign).toHaveBeenCalledWith(
        expect.objectContaining({
          heart_rate: "72",
          body_temperature: "36.8",
          blood_pressure_systolic: "118",
          blood_pressure_diastolic: "76",
          blood_sugar: "96",
        })
      )
    );
  });
});
