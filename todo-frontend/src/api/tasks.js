import axios from "axios";

// Set VITE_API_BASE_URL in .env (see .env.example). The fallback keeps local dev working.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api",
});

// A date input yields "" when empty, but DRF's DateField only accepts a date or null.
const toPayload = (form) => ({ ...form, due_date: form.due_date || null });

// Every function resolves with response.data so callers never touch axios internals.
export const getTasks = (signal) => api.get("tasks/", { signal }).then((r) => r.data);

export const createTask = (form) =>
  api.post("tasks/", toPayload(form)).then((r) => r.data);

export const updateTask = (id, form) =>
  api.put(`tasks/${id}/`, toPayload(form)).then((r) => r.data);

export const patchTaskStatus = (id, status) =>
  api.patch(`tasks/${id}/`, { status }).then((r) => r.data);

export const deleteTask = (id) => api.delete(`tasks/${id}/`);

export const isCancel = axios.isCancel;