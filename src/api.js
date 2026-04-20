import { AUTH_STORAGE_KEY } from "./AuthContext";

function getDefaultApiBaseUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:8080";
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:8080`;
}

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, "") || getDefaultApiBaseUrl();

function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const session = JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY) || "null");
    return session?.token || null;
  } catch (error) {
    return null;
  }
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const error = await toRequestError(response);
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function toRequestError(response) {
  let payload = null;
  const contentType = response.headers.get("content-type") || "";

  try {
    payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();
  } catch (error) {
    payload = null;
  }

  if (payload && typeof payload === "object") {
    const details = Array.isArray(payload.details) && payload.details.length > 0
      ? ` ${payload.details.join(" ")}`
      : "";
    const message = payload.message || payload.error || `Request failed with status ${response.status}`;
    return new Error(`${message}${details}`.trim());
  }

  if (typeof payload === "string" && payload.trim()) {
    return new Error(payload.trim());
  }

  return new Error(`Request failed with status ${response.status}`);
}

function sortByDateDesc(items, fieldName) {
  return [...items].sort((a, b) => {
    const left = a?.[fieldName] ? new Date(a[fieldName]).getTime() : 0;
    const right = b?.[fieldName] ? new Date(b[fieldName]).getTime() : 0;
    return right - left;
  });
}

export function loginUser(payload) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMyMedications() {
  return request("/api/medications/me").then((items) => sortByDateDesc(items, "start_date"));
}

export function updateMedicationSlackNotifications(medicationId, enabled) {
  return request(`/api/medications/${medicationId}/slack-notifications`, {
    method: "PUT",
    body: JSON.stringify({ enabled }),
  });
}

export function sendMedicationSlackReminder(medicationId) {
  return request(`/api/medications/${medicationId}/slack-reminder`, {
    method: "POST",
  });
}

export function createMedication(payload) {
  return request("/api/medications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMyMedicationRecords() {
  return request("/api/medication-records/me");
}

export function createMedicationRecord(payload) {
  return request("/api/medication-records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateMySlackConnection(slackMemberId) {
  return request("/api/users/me/slack-connection", {
    method: "PUT",
    body: JSON.stringify({ slack_member_id: slackMemberId }),
  });
}

export function createVitalSign(payload) {
  return request("/api/vitalsigns", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMyVitalSigns() {
  return request("/api/vitalsigns/me").then((items) => sortByDateDesc(items, "date"));
}
