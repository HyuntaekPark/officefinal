const API_BASE_URL = import.meta.env.DEV ? "http://localhost:3001/api" : "/api";
const ADMIN_TOKEN_KEY = "ksaoffice-admin-token";

async function request(path, options = {}) {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({
      message: "\uc694\uccad \ucc98\ub9ac\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4."
    }));
    throw new Error(errorBody.message || "\uc694\uccad \ucc98\ub9ac\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getTeachers() {
  return request("/teachers");
}

export function loginAdmin(id, password) {
  return request("/admin/login", {
    method: "POST",
    body: JSON.stringify({ id, password })
  });
}

export function searchTeachers(name) {
  return request(`/teachers/search?name=${encodeURIComponent(name)}`);
}

export function getTeachersByTime(day, period) {
  return request(`/teachers/by-time?day=${encodeURIComponent(day)}&period=${encodeURIComponent(period)}`);
}

export function getCurrentOfficeHourTeachers() {
  return request("/teachers/current-office-hour");
}

export function createTeacher(payload) {
  return request("/teachers", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateTeacher(id, payload) {
  return request(`/teachers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteTeacher(id) {
  return request(`/teachers/${id}`, {
    method: "DELETE"
  });
}

export function saveAdminToken(token) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function hasAdminToken() {
  return Boolean(localStorage.getItem(ADMIN_TOKEN_KEY));
}
