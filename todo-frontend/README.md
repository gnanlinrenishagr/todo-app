# Task Manager UI

Responsive React frontend for the task manager API.

## Tech stack

- React 19 with hooks
- Vite
- axios
- Plain CSS with custom properties (automatic light and dark theme)

## Setup

Requires Node.js 18+ and the backend running on http://127.0.0.1:8000 (see `../backend/README.md`).

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run dev
```

Open http://localhost:5173.

### Environment variables

| Variable            | Description                                            | Default                      |
| ------------------- | ------------------------------------------------------ | ---------------------------- |
| `VITE_API_BASE_URL` | Backend base URL, without `/tasks/` at the end         | `http://127.0.0.1:8000/api`  |

Restart `npm run dev` after changing `.env`. Variable names must start with `VITE_` to be exposed to the browser.

### Scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start the dev server           |
| `npm run build`   | Production build into `dist/`  |
| `npm run preview` | Preview the production build   |

## Features

- Create, edit and delete tasks, with a confirmation step before deleting
- Change status directly from a task card
- Search by title or description, and filter by status with live counts
- Priority shown on each card, overdue dates highlighted, completed tasks struck through
- Loading skeletons, empty states, an error state with retry, and toast notifications
- Keyboard accessible with visible focus, labelled form fields and reduced-motion support

## Project structure

```
src/
├── api/tasks.js          axios instance and one function per endpoint
├── hooks/
│   ├── useTasks.js       all server state and CRUD logic
│   └── useToast.js       toast state with auto-dismiss
├── components/
│   ├── TaskForm.jsx      create / edit form (owns its own state)
│   ├── TaskCard.jsx      single task, memoized
│   ├── TaskToolbar.jsx   search box and status chips
│   └── Toast.jsx
├── utils/helpers.js      date formatting and API error parsing
├── constants.js          statuses, priorities, empty form
├── App.jsx               composes the pieces
└── App.css               styles and theme tokens
```

## Design decisions

- **Separation of concerns**: `App.jsx` never calls axios. Server logic lives in `useTasks`, HTTP details live in `api/tasks.js`, and components only receive props and callbacks.
- **Fewer requests**: editing uses data already in state, an update replaces the task from the PUT response, and a delete removes it locally instead of refetching the list.
- **Optimistic status changes**: the PATCH result is assumed to succeed so the UI feels instant, and it rolls back with an error toast if the request fails.
- **Memoization**: filtering and counts use `useMemo`, handlers use `useCallback`, and `TaskCard` is wrapped in `memo`, so changing one task does not re-render the others.
- **Form reset with `key`**: `TaskForm` is given `key={editingTodo?.id ?? "new"}`, so switching between tasks remounts it with fresh state and no sync effect is needed.
- **Empty due date**: a cleared date input sends `null`, because the API only accepts a date or `null`.
- **Client-side filtering**: search and status filters run in the browser, which is fine at this scale. For large lists they would move to the server together with pagination.
- **Cancelled request in development**: in `npm run dev`, React StrictMode mounts effects twice, so the first `GET /api/tasks/` shows as `(canceled)` in the Network tab. This is the abort controller cleaning up and does not happen in a production build.