# AS Clinic Backend

Production-style MVP backend for an AI-powered dental clinic receptionist and appointment booking agent.

## Project Overview

AS Clinic is a dental clinic AI receptionist that can:
- Talk to patients via chat interface
- Answer common clinic questions
- Book, reschedule, and cancel appointments
- Capture patient information
- Store conversation history

## Tech Stack

- **Python** - Backend language
- **FastAPI** - Web framework
- **SQLite** - Database
- **SQLAlchemy** - ORM
- **Pydantic** - Data validation
- **OpenAI API** - AI conversation

## Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your OPENAI_API_KEY

# Run the server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| GET /api/health | Health check |
| GET /api/clinic/info | Clinic information |
| GET /api/clinic/faqs | FAQ items |
| POST /api/patients | Create patient |
| GET /api/patients | List patients |
| POST /api/appointments | Create appointment |
| GET /api/appointments | List appointments |
| GET /api/appointments/available-slots | Get available time slots |
| POST /api/ai/chat | Chat with AI |
| POST /api/ai/book-from-chat | Book appointment |
| POST /api/ai/reschedule-from-chat | Reschedule appointment |
| POST /api/ai/cancel-from-chat | Cancel appointment |

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app entry
│   ├── core/                # Config, database
│   ├── models/              # SQLAlchemy models
│   ├── schemas/              # Pydantic schemas
│   ├── crud/                # Database operations
│   ├── api/routes/          # REST endpoints
│   ├── services/            # Business logic
│   ├── utils/               # Helpers
│   └── seed/                # Database seeder
├── requirements.txt
├── .env.example
└── as_clinic.db             # SQLite database
```

## Database

The database is automatically created and seeded on first run with:
- Clinic settings
- FAQ items
- Sample patients and appointments

## Running

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Frontend

The frontend is in the `frontend/` directory. See `frontend/README.md` for details.
