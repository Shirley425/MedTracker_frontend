function getDefaultApiBaseUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:8080";
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:8080`;
}

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, "") || getDefaultApiBaseUrl();

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function sortByDateDesc(items, fieldName) {
  return [...items].sort((a, b) => {
    const left = a?.[fieldName] ? new Date(a[fieldName]).getTime() : 0;
    const right = b?.[fieldName] ? new Date(b[fieldName]).getTime() : 0;
    return right - left;
  });
}

export function getMedications() {
  return request("/api/medications").then((items) => sortByDateDesc(items, "start_date"));
}

export function loginUser(payload) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMedicationsByUserId(userId) {
  return request(`/api/medications/user/${userId}`).then((items) =>
    sortByDateDesc(items, "start_date")
  );
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

export function getVitalSigns() {
  return request("/api/vitalsigns").then((items) => sortByDateDesc(items, "date"));
}

export function getVitalSignsByUserId(userId) {
  return request(`/api/vitalsigns/user/${userId}`).then((items) =>
    sortByDateDesc(items, "date")
  );
}

export function getMedicationRecordsByUserId(userId) {
  return request(`/api/medication-records/user/${userId}`);
}

export function createMedicationRecord(payload) {
  return request("/api/medication-records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUserSlackWebhook(userId, webhookUrl) {
  return request(`/api/users/${userId}/slack-webhook`, {
    method: "PUT",
    body: JSON.stringify({ webhookUrl }),
  });
}

export function createVitalSign(payload) {
  return request("/api/vitalsigns", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
