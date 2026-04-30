from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from database import engine, Base
from routers import auth, projects, tasks, dashboard

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Team Task Manager API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

# Serve static files in production
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")