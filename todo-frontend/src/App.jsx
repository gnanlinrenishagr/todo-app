import { useCallback, useMemo, useState } from "react";
import "./App.css";
import { STATUSES } from "./constants";
import { useTasks } from "./hooks/useTasks";
import { useToast } from "./hooks/useToast";
import TaskCard from "./components/TaskCard";
import TaskForm from "./components/TaskForm";
import TaskToolbar from "./components/TaskToolbar";
import Toast from "./components/Toast";

function App() {
  const { toast, showToast } = useToast();
  const { todos, loading, loadError, saving, reload, saveTask, changeStatus, removeTask } =
    useTasks(showToast);

  const [editingTodo, setEditingTodo] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const handleSave = useCallback(
    (formData) => saveTask(editingTodo?.id ?? null, formData),
    [saveTask, editingTodo]
  );

  const handleDelete = useCallback(
    async (id) => {
      const ok = await removeTask(id);
      // If the deleted task was being edited, leave edit mode
      if (ok) setEditingTodo((current) => (current?.id === id ? null : current));
    },
    [removeTask]
  );

  const cancelEdit = useCallback(() => setEditingTodo(null), []);

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("All");
  };

  const counts = useMemo(() => {
    const result = { All: todos.length };
    STATUSES.forEach((s) => (result[s] = 0));
    todos.forEach((t) => {
      if (result[t.status] !== undefined) result[t.status] += 1;
    });
    return result;
  }, [todos]);

  const visibleTodos = useMemo(() => {
    const q = query.trim().toLowerCase();
    return todos.filter((t) => {
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [todos, query, statusFilter]);

  const filtersActive = query.trim() !== "" || statusFilter !== "All";
  const percentDone = counts.All ? Math.round((counts.Completed / counts.All) * 100) : 0;

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Task manager</h1>
          <p className="subtitle">
            {counts.Completed} of {counts.All} tasks completed
          </p>
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentDone}
          aria-label="Completion progress"
        >
          <span style={{ width: `${percentDone}%` }} />
        </div>
      </header>

      <main className="layout">
        <TaskForm
          key={editingTodo?.id ?? "new"}
          editingTodo={editingTodo}
          saving={saving}
          onSubmit={handleSave}
          onCancel={cancelEdit}
        />

        <section className="list-panel" aria-labelledby="list-title">
          <h2 id="list-title" className="visually-hidden">
            Task list
          </h2>

          <TaskToolbar
            query={query}
            onQueryChange={setQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            counts={counts}
          />

          {loading ? (
            <div className="skeletons" aria-busy="true" aria-label="Loading tasks">
              <div className="skeleton" />
              <div className="skeleton" />
              <div className="skeleton" />
            </div>
          ) : loadError ? (
            <div className="state state-error" role="alert">
              <p>
                <strong>Couldn’t load tasks.</strong> {loadError}
              </p>
              <button type="button" className="btn btn-secondary" onClick={reload}>
                Try again
              </button>
            </div>
          ) : visibleTodos.length === 0 ? (
            <div className="state">
              {filtersActive ? (
                <>
                  <p>No tasks match your filters.</p>
                  <button type="button" className="btn btn-secondary" onClick={clearFilters}>
                    Clear filters
                  </button>
                </>
              ) : (
                <p>No tasks yet. Add your first task using the form.</p>
              )}
            </div>
          ) : (
            <div className="task-list">
              {visibleTodos.map((todo) => (
                <TaskCard
                  key={todo.id}
                  todo={todo}
                  isEditing={editingTodo?.id === todo.id}
                  onEdit={setEditingTodo}
                  onStatusChange={changeStatus}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Toast toast={toast} />
    </div>
  );
}

export default App;