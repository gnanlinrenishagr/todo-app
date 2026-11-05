import { memo, useState } from "react";
import { STATUSES } from "../constants";
import { formatDate, slug, todayISO } from "../utils/helpers";

// memo: only the card whose props changed re-renders
const TaskCard = memo(function TaskCard({ todo, isEditing, onEdit, onStatusChange, onDelete }) {
  const [confirming, setConfirming] = useState(false);

  const overdue =
    todo.due_date && todo.status !== "Completed" && todo.due_date < todayISO();

  return (
    <article
      className={`task priority-${slug(todo.priority)} ${
        todo.status === "Completed" ? "is-done" : ""
      } ${isEditing ? "is-editing" : ""}`}
    >
      <div className="task-main">
        <h3 className="task-title">{todo.title}</h3>
        {todo.description && <p className="task-desc">{todo.description}</p>}

        <div className="task-meta">
          <span className={`badge priority-badge ${slug(todo.priority)}`}>
            {todo.priority} priority
          </span>
          <span className={`due ${overdue ? "overdue" : ""}`}>
            {todo.due_date
              ? `${overdue ? "Overdue · " : "Due "}${formatDate(todo.due_date)}`
              : "No due date"}
          </span>
        </div>
      </div>

      <div className="task-actions">
        <select
          className={`status-select ${slug(todo.status)}`}
          value={todo.status}
          onChange={(e) => onStatusChange(todo.id, e.target.value)}
          aria-label={`Status for ${todo.title}`}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {confirming ? (
          <div className="confirm" role="alertdialog" aria-label="Confirm delete">
            <span>Delete this task?</span>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(todo.id)}
            >
              Delete
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setConfirming(false)}
            >
              Keep
            </button>
          </div>
        ) : (
          <div className="row-buttons">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit(todo)}>
              Edit
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-danger-text"
              onClick={() => setConfirming(true)}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
});

export default TaskCard;