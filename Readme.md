# Task Manager

A full-stack task management app: a **Django REST Framework** API and a **React (Vite)** single-page frontend.

```
todo-app/
├── backend/    Django + DRF REST API (SQLite)
└── frontend/   React + Vite UI
```

## Features

- Create, view, edit and delete tasks (full CRUD)
- Status (Pending / In Progress / Completed), priority and optional due date
- Change a task's status straight from the list
- Search by title or description and filter by status
- Overdue highlighting and a completion progress bar
- Responsive layout with automatic light and dark theme

## Quick start

You need two terminals, one for each part.

**1. Backend** (runs on http://127.0.0.1:8000)

```bash
cd todo-backend
python -m venv venv
venv\Scripts\activate          # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env           # Windows: copy .env.example .env
python manage.py migrate
python manage.py runserver
```

**2. Frontend** (runs on http://localhost:5173)

```bash
cd frontend
npm install
cp .env.example .env           # Windows: copy .env.example .env
npm run dev
```

Open http://localhost:5173.

See [`todo-backend/README.md`](todo-backend/README.md) and [`todo-frontend/README.md`](todo-frontend/README.md) for details, configuration and design decisions.