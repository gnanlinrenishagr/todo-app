import { STATUSES } from "../constants";

export default function TaskToolbar({ query, onQueryChange, statusFilter, onStatusChange, counts }) {
  return (
    <div className="toolbar">
      <input
        type="search"
        className="search"
        placeholder="Search title or description"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        aria-label="Search tasks"
      />

      <div className="chips" role="group" aria-label="Filter by status">
        {["All", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            className={`chip ${statusFilter === s ? "active" : ""}`}
            aria-pressed={statusFilter === s}
            onClick={() => onStatusChange(s)}
          >
            {s}
            <span className="chip-count">{counts[s]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}