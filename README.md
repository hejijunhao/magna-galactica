# Magna Galactica

A full-stack application with FastAPI backend and Next.js frontend.

## Project Structure

```
magna-galactica/
├── backend/          # FastAPI application
│   ├── main.py       # Main FastAPI app
│   ├── requirements.txt
│   └── README.md
└── frontend/         # Next.js application
    ├── app/          # Next.js app directory
    ├── public/       # Static assets
    └── package.json
```

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

### Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

The API will be available at `http://localhost:8000`
- Interactive API docs: `http://localhost:8000/docs`

### Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## Development

Both servers support hot-reload:
- Backend: FastAPI with `--reload` flag
- Frontend: Next.js with Turbopack

## Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation

### Frontend
- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Turbopack**: Next-gen bundler
