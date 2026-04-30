from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional, List
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    MEMBER = "member"

class TaskStatus(str, Enum):
    TODO = "To Do"
    IN_PROGRESS = "In Progress"
    DONE = "Done"

class TaskPriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

# User schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator('password')
    def password_length(cls, v):
        if len(v) > 72:
            raise ValueError('Password cannot exceed 72 characters')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Project schemas
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    creator_id: int
    created_at: datetime
    role: Optional[str] = None
    
    class Config:
        from_attributes = True

# Member schemas
class AddMember(BaseModel):
    email: EmailStr
    role: UserRole = UserRole.MEMBER

class MemberResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    joined_at: datetime

# Task schemas
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    assignee_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    assignee_id: Optional[int] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    due_date: Optional[datetime]
    priority: TaskPriority
    status: TaskStatus
    project_id: int
    assignee_id: Optional[int]
    assignee_name: Optional[str] = None
    created_by_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Dashboard schemas
class TasksByStatus(BaseModel):
    status: str
    count: int

class TasksPerUser(BaseModel):
    user_id: int
    user_name: str
    task_count: int

class DashboardStats(BaseModel):
    total_tasks: int
    tasks_by_status: List[TasksByStatus]
    tasks_per_user: List[TasksPerUser]
    overdue_tasks: List[TaskResponse]

