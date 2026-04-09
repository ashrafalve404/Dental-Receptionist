# AS Clinic Frontend

AI Voice Receptionist / Appointment Booking Agent Frontend built with React, Vite, TypeScript, Tailwind CSS, and Framer Motion.

## Tech Stack

- **React 18** - UI Library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons

## Project Structure

```
src/
├── api/               # API layer (axios, clinicApi, patientApi, appointmentApi, aiApi)
├── components/
│   ├── layout/        # Navbar, Footer
│   ├── ui/            # Button, Input, Card, Badge, Modal, Loader, EmptyState
│   ├── chat/          # Chat components (ChatWindow, ChatMessage, ChatInput, etc.)
│   └── appointment/   # Booking components (BookingForm, AppointmentCard, etc.)
├── pages/             # Page components (Home, ChatReceptionist, BookAppointment, etc.)
├── utils/             # Constants, formatDate helpers
├── data/              # Mock data
└── App.tsx            # Main app with routing
```

## Pages

- `/` - Landing page with hero, features, services
- `/chat` - AI Chat receptionist interface
- `/book` - Appointment booking form
- `/manage` - Find and manage appointments
- `/dashboard` - Admin dashboard with stats

## Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

## API Integration

The frontend connects to the FastAPI backend. Make sure the backend is running at `http://localhost:8000`.

Configuration in `src/utils/constants.ts`:
```typescript
export const API_BASE_URL = 'http://localhost:8000';
```

## Features

- AI Chat with conversation history
- Appointment booking with available slots
- Reschedule and cancel appointments
- Admin dashboard with stats
- Responsive design
- Smooth animations
- Professional medical UI theme

## Running

```bash
# Development
npm run dev

# Build
npm run build

# Preview
npm run preview
```

Frontend runs on `http://localhost:5173` by default.
