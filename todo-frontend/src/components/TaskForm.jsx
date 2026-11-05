import { useCallback, useEffect, useRef, useState } from "react";
import { EMPTY_FORM, PRIORITIES, STATUSES } from "../constants";

const toFormData = (todo) =>
  todo
    ? {
        title: todo.title,
        description: todo.description || "",
        status: todo.status,
        priority: todo.priority,
        due_date: todo.due_date || "",
      }
    : EMPTY_FORM;


export default function TaskForm({ editingTodo, saving, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(() => toFormData(editingTodo));
  const formRef = useRef(null);
  const titleRef = useRef(null);
  const isEditing = Boolean(editingTodo);

  // Bring the form into view and focus the title when an edit starts (helps on mobile)
  useEffect(() => {
    if (!isEditing) return;
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    titleRef.current?.focus({ preventScroll: true });
  }, [isEditing]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const ok = await onSubmit(formData);
    if (!ok) return;
    if (isEditing) onCancel();
    else setFormData(EMPTY_FORM);
  };

  return (
    <section className="panel form-panel" ref={formRef} aria-labelledby="form-title">
      <h2 id="form-title">{isEditing ? "Edit task" : "New task"}</h2>

      <form onSubmit={handleSubmit} className="form">
        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            ref={titleRef}
            type="text"
            name="title"
            placeholder="e.g. Fix pagination bug"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Add context, links or acceptance criteria"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="priority">Priority</label>
            <select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="due_date">Due date</label>
          <input
            id="due_date"
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : isEditing ? "Save changes" : "Add task"}
          </button>
          {isEditing && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}