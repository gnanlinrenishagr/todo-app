export default function Toast({ toast }) {
  return (
    <div className="toast-region" aria-live="polite">
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}