import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, AUTH_STORAGE_KEY } from "../AuthContext";
import Login from "./Login";

const mockNavigate = jest.fn();

jest.mock(
  "react-router-dom",
  () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: { from: { pathname: "/dashboard" } } }),
  }),
  { virtual: true }
);

jest.mock("../api", () => ({
  loginUser: jest.fn(),
}));

const { loginUser } = require("../api");

describe("Login", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it("signs in and redirects to the dashboard", async () => {
    loginUser.mockResolvedValue({
      token: "jwt-token",
      user: { id: 1, name: "Joe Doe", age: 31, email: "joe@example.com" },
    });

    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    await userEvent.type(document.querySelector('input[type="email"]'), " joe@example.com ");
    await userEvent.type(document.querySelector('input[type="password"]'), "joe123");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(loginUser).toHaveBeenCalledWith({
      email: "joe@example.com",
      password: "joe123",
    });

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true })
    );

    const savedSession = JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY));
    expect(savedSession.token).toBe("jwt-token");
    expect(savedSession.user.email).toBe("joe@example.com");
  });

  it("shows an error when login fails", async () => {
    loginUser.mockRejectedValue(new Error("Invalid email or password."));

    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    await userEvent.type(document.querySelector('input[type="email"]'), "joe@example.com");
    await userEvent.type(document.querySelector('input[type="password"]'), "wrong-password");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText("Invalid email or password.")).toBeInTheDocument();
    await waitFor(() => expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull());
  });
});
