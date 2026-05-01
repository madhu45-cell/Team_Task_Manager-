# Team Task Manager – Full‑Stack Project Management App

**Live Demo**: [team-task-manager-ochre-six.vercel.app](https://team-task-manager-ochre-six.vercel.app)

A collaborative task management web application where users can create projects, assign tasks, track progress, and manage team members with role‑based access (Admin / Member). Built with **FastAPI** (backend) and **React + Vite** (frontend).

---

## 📋 Features

- **User Authentication** – Sign up, log in, secure JWT‑based sessions.
- **Project Management** – Create projects (creator becomes Admin). Admin can add/remove members; members view assigned projects.
- **Task Management** – Create tasks with title, description, due date, priority. Assign tasks to users. Update status: *To Do*, *In Progress*, *Done*.
- **Role‑Based Access** – Admins manage all tasks & members; members can only view/update tasks assigned to them.
- **Dashboard** – Overview: total tasks, tasks by status, tasks per user, overdue tasks.
- **Full‑stack** – FastAPI (Python) backend + React (Vite) frontend.

---

## 🛠️ Tech Stack

| Layer       | Technology                                         |
|-------------|----------------------------------------------------|
| Backend     | FastAPI, SQLAlchemy, SQLite (dev) / PostgreSQL (prod), JWT, bcrypt |
| Frontend    | React, Vite, Tailwind CSS, React Router, Axios, date-fns, React Hot Toast |
| Deployment  | Backend: Render – Frontend: Vercel                 |

---

## 🚀 Live URLs

- **Frontend (Vercel)**: [https://team-task-manager-ochre-six.vercel.app](https://team-task-manager-ochre-six.vercel.app)
- **Backend API (Render)**: *[https://team-task-backend.onrender.com](https://team-task-backend.onrender.com)* (replace with your actual backend URL if different)

---


## 💻 Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend (FastAPI)

1. **Clone the repository**  
   ```bash
   git clone https://github.com/yourusername/team-task-manager.git
   cd team-task-manager/backend

python -m venv venv
source venv/bin/activate   # Linux/macOS
venv\Scripts\activate      # Windows
pip install -r requirements.txt
SECRET_KEY=your-super-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./taskmanager.db
uvicorn main:app --reload
