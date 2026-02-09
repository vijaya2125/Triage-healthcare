const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || "Request failed";
    throw new Error(message);
  }
  return data;
}

export function signup(payload) {
  return request("/auth/signup", {
    method: "POST",
    body: payload
  });
}

export function login(payload) {
  return request("/auth/login", {
    method: "POST",
    body: payload
  });
}

export function createAssessment(payload, token) {
  return request("/assessment", {
    method: "POST",
    body: payload,
    token
  });
}

export function getAssessmentHistory(token) {
  return request("/assessment/history", {
    method: "GET",
    token
  });
}

export function triggerMockAlert(payload, token) {
  return request("/alerts/mock", {
    method: "POST",
    body: payload,
    token
  });
}

