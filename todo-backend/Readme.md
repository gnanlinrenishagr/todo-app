# Task Manager API

REST API for the task manager, built with Django and Django REST Framework.

## Tech stack

- Python, Django 6.1
- Django REST Framework (`ModelViewSet` + router)
- django-cors-headers (CORS allow-list for the frontend)
- python-decouple (configuration from environment variables)
- SQLite

## Setup

```bash
# 1. Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate            # PowerShell: venv\Scripts\Activate.ps1 | macOS/Linux: source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env             # Windows: copy .env.example .env
# Generate a secret key and paste it into .env as SECRET_KEY:
python -c "import secrets; print(secrets.token_urlsafe(50))"

# 4. Create the database tables and start the server
python manage.py migrate
python manage.py runserver
```

The API is now available at http://127.0.0.1:8000/api/tasks/

### Environment variables

| Variable               | Description                                | Example                                           |
| ---------------------- | ------------------------------------------ | ------------------------------------------------- |
| `SECRET_KEY`           | Django secret key (required)               | output of the command above                       |
| `DEBUG`                | Debug mode (defaults to `False`)           | `True`                                            |
| `ALLOWED_HOSTS`        | Comma-separated hosts                      | `127.0.0.1,localhost`                             |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins           | `http://localhost:5173,http://127.0.0.1:5173`     |

## API

Base URL: `/api/`

| Method | Endpoint        | Description                      |
| ------ | --------------- | -------------------------------- |
| GET    | `/tasks/`       | List all tasks (newest first)    |
| POST   | `/tasks/`       | Create a task                    |
| GET    | `/tasks/{id}/`  | Retrieve one task                |
| PUT    | `/tasks/{id}/`  | Replace a task (all fields)      |
| PATCH  | `/tasks/{id}/`  | Partial update (e.g. status)     |
| DELETE | `/tasks/{id}/`  | Delete a task                    |

### Task fields

| Field         | Type     | Notes                                              |
| ------------- | -------- | -------------------------------------------------- |
| `id`          | integer  | read-only                                          |
| `title`       | string   | required, max 200 characters                       |
| `description` | string   | optional                                           |
| `status`      | string   | `Pending` (default), `In Progress`, `Completed`    |
| `priority`    | string   | `Low`, `Medium` (default), `High`                  |
| `due_date`    | date     | optional, `YYYY-MM-DD` or `null`                   |
| `created_at`  | datetime | read-only                                          |
| `updated_at`  | datetime | read-only                                          |

### Example

`POST /api/tasks/`

```json
{
  "title": "Write README",
  "description": "Document setup and API",
  "priority": "High",
  "due_date": "2026-11-30"
}
```

Response `201 Created`

```json
{
  "id": 1,
  "title": "Write README",
  "description": "Document setup and API",
  "status": "Pending",
  "priority": "High",
  "due_date": "2026-11-30",
  "created_at": "2026-11-05T12:00:00Z",
  "updated_at": "2026-11-05T12:00:00Z"
}
```

Validation errors return `400` with a field-keyed body, for example `{"title": ["This field may not be blank."]}`. The frontend shows these messages to the user.

## Tests

```bash
python manage.py test
```

The suite covers create with defaults, validation (blank title, invalid status), optional due date, full update (PUT), status-only update (PATCH), delete, and the list response shape.

## Project structure

```
backend/
├── manage.py
├── requirements.txt
├── .env.example
├── project/            settings (env-driven), root URLs
└── todoapp/
    ├── models.py       Todo model with TextChoices for status and priority
    ├── serializers.py  TodoSerializer (read-only id and timestamps)
    ├── views.py        TodoViewSet (ModelViewSet)
    ├── urls.py         router registration
    ├── admin.py        admin configuration
    └── tests.py        API tests
```

## Design decisions

- **Secrets in the environment**: `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` and CORS origins come from `.env`, which is git-ignored. `DEBUG` defaults to `False`.
- **`TextChoices`** for status and priority keep the allowed values in one place and avoid magic strings in code.
- **`Meta.ordering = ["-created_at"]`** is on the model, so every query returns newest first by default.
- **`description` is `blank=True, default=""`** rather than nullable, so there is only one "empty" value.
- **PUT and PATCH** are both exposed: the frontend uses PUT for the full edit form and PATCH for quick status changes.
- **Open API**: there is no authentication, since this is a CRUD exercise. Adding token or session authentication with `IsAuthenticated` is the next step for a real deployment.