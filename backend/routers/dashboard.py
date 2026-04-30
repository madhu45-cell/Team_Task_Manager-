from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime
from typing import List
import models, schemas
from database import get_db
from auth import get_current_user
from dependencies import is_project_member

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Get all projects where user is a member
    user_projects = db.query(models.ProjectMember.project_id).filter(
        models.ProjectMember.user_id == current_user.id
    ).subquery()
    
    # Total tasks across all user's projects
    total_tasks = db.query(func.count(models.Task.id)).filter(
        models.Task.project_id.in_(user_projects)
    ).scalar() or 0
    
    # Tasks by status
    tasks_by_status = db.query(
        models.Task.status,
        func.count(models.Task.id)
    ).filter(
        models.Task.project_id.in_(user_projects)
    ).group_by(models.Task.status).all()
    
    tasks_by_status_list = [
        schemas.TasksByStatus(status=status.value, count=count)
        for status, count in tasks_by_status
    ]
    
    # Tasks per user (assignee)
    tasks_per_user = db.query(
        models.User.id,
        models.User.name,
        func.count(models.Task.id)
    ).join(
        models.Task, models.Task.assignee_id == models.User.id
    ).filter(
        models.Task.project_id.in_(user_projects)
    ).group_by(models.User.id, models.User.name).all()
    
    tasks_per_user_list = [
        schemas.TasksPerUser(user_id=user_id, user_name=name, task_count=count)
        for user_id, name, count in tasks_per_user
    ]
    
    # Overdue tasks (due date < now and status != Done)
    now = datetime.utcnow()
    overdue_tasks_query = db.query(models.Task).filter(
        and_(
            models.Task.project_id.in_(user_projects),
            models.Task.due_date < now,
            models.Task.status != models.TaskStatus.DONE
        )
    ).all()
    
    overdue_tasks = []
    for task in overdue_tasks_query:
        assignee_name = None
        if task.assignee_id:
            assignee = db.query(models.User).filter(models.User.id == task.assignee_id).first()
            assignee_name = assignee.name if assignee else None
        
        overdue_tasks.append(schemas.TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            due_date=task.due_date,
            priority=task.priority,
            status=task.status,
            project_id=task.project_id,
            assignee_id=task.assignee_id,
            assignee_name=assignee_name,
            created_by_id=task.created_by_id,
            created_at=task.created_at,
            updated_at=task.updated_at
        ))
    
    return schemas.DashboardStats(
        total_tasks=total_tasks,
        tasks_by_status=tasks_by_status_list,
        tasks_per_user=tasks_per_user_list,
        overdue_tasks=overdue_tasks
    )