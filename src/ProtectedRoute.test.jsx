import React from "react";
import { render, screen } from "@testing-library/react";
import { AuthProvider, AUTH_STORAGE_KEY } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";

jest.mock(
  "react-router-dom",
  () => ({
    Navigate: ({ to }) => <div>Redirect:{to}</div>,
    useLocation: () => ({ pathname: "/dashboard" }),
  }),
  { virtual: true }
);

describe("ProtectedRoute", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("redirects unauthenticated users to login", async () => {
    render(
      <AuthProvider>
        <ProtectedRoute>
          <div>Secret Dashboard</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    expect(await screen.findByText("Redirect:/login")).toBeInTheDocument();
    expect(screen.queryByText("Secret Dashboard")).not.toBeInTheDocument();
  });

  it("renders protected content when a saved session exists", async () => {
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token: "token-123",
        user: { id: 1, name: "Joe Doe", age: 31 },
      })
    );

    render(
      <AuthProvider>
        <ProtectedRoute>
          <div>Secret Dashboard</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    expect(await screen.findByText("Secret Dashboard")).toBeInTheDocument();
  });
});
