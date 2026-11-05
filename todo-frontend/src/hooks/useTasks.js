import { useCallback, useEffect, useState } from "react";
import {
  createTask,
  deleteTask,
  getTasks,
  isCancel,
  patchTaskStatus,
  updateTask,
} from "../api/tasks";
import { getErrorMessage } from "../utils/helpers";

/**
 * Owns all server state and CRUD logic for tasks.
 * Components stay presentational and never call the API directly.
 */
export function useTasks(showToast) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  /* GET - fetch all */
  const fetchTodos = useCallback(async (signal) => {
    try {
      setTodos(await getTasks(signal));
      setLoadError("");
      setLoading(false);
    } catch (error) {
      // A cancelled request is expected (cleanup / StrictMode), not a failure
      if (isCancel(error)) return;
      console.error("Fetch error:", error.response?.data || error.message);
      setLoadError(getErrorMessage(error));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchTodos(controller.signal);
    return () => controller.abort();
  }, [fetchTodos]);

  const reload = useCallback(() => {
    setLoading(true);
    fetchTodos();
  }, [fetchTodos]);

  /* POST (no editingId) or PUT (editingId). Resolves true on success. */
  const saveTask = useCallback(
    async (editingId, formData) => {
      setSaving(true);
      try {
        if (editingId) {
          const updated = await updateTask(editingId, formData);
          // Update in place when the API returns the object; otherwise refetch
          if (updated?.id === editingId) {
            setTodos((prev) => prev.map((t) => (t.id === editingId ? updated : t)));
          } else {
            await fetchTodos();
          }
          showToast("Task updated");
        } else {
          await createTask(formData);
          await fetchTodos();
          showToast("Task created");
        }
        return true;
      } catch (error) {
        console.error("Save error:", error.response?.data || error.message);
        showToast(getErrorMessage(error), "error");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fetchTodos, showToast]
  );

  /* PATCH - status only (optimistic, rolls back on failure) */
  const changeStatus = useCallback(
    async (id, status) => {
      let previous;
      setTodos((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          previous = t.status;
          return { ...t, status };
        })
      );

      try {
        await patchTaskStatus(id, status);
      } catch (error) {
        console.error("Status update error:", error);
        setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status: previous } : t)));
        showToast("Could not update status", "error");
      }
    },
    [showToast]
  );

  /* DELETE. Resolves true on success. */
  const removeTask = useCallback(
    async (id) => {
      try {
        await deleteTask(id);
        setTodos((prev) => prev.filter((t) => t.id !== id));
        showToast("Task deleted");
        return true;
      } catch (error) {
        console.error("Delete error:", error);
        showToast("Could not delete task", "error");
        return false;
      }
    },
    [showToast]
  );

  return { todos, loading, loadError, saving, reload, saveTask, changeStatus, removeTask };
}