from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from database import engine, Base
from routers import auth, projects, tasks, dashboard

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Team Task Manager API", docs_url="/docs", redoc_url="/redoc")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://team-task-manager-ochre-six.vercel.app",  # your current preview URL
        "https://team-task-manager.vercel.app",            # your production URL (if different)
        "http://localhost:5173",                           # Vite default
        "http://localhost:3000",                           # React default
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {"message": "Team Task Manager API is live"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

# Static files (optional)
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")