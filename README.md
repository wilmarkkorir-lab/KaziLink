# HireBoard – Job Portal (Django + SQLite + Vite/React/Tailwind)

## Backend
    cd backend
    python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
    pip install -r requirements.txt
    python manage.py makemigrations portal
    python manage.py migrate
    python manage.py createsuperuser                   # becomes the "admin" role automatically
    python manage.py runserver                         # http://localhost:8000  (Django admin at /admin/)

## Frontend
    cd frontend
    npm install
    npm run dev                                        # http://localhost:5173

## API
POST /api/auth/register|login/ · GET /api/auth/me/
GET /api/jobs/?search=&job_type=&category=&location=&salary_min=&ordering=
POST /api/jobs/ (employer) · GET /api/jobs/mine/ · GET /api/jobs/{id}/applicants/
POST /api/applications/ (seeker, multipart) · PATCH /api/applications/{id}/ {status} (employer)
GET /api/admin/stats/ · GET/PATCH /api/admin/users/ (admin)
