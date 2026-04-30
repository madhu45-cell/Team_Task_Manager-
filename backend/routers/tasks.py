from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db
from auth import get_current_user
from dependencies import is_project_admin, is_project_member

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.post("/projects/{project_id}/tasks", response_model=schemas.TaskResponse)
def create_task(
    project_id: int,
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not is_project_member(project_id, current_user.id, db):
        raise HTTPException(status_code=403, detail="Not a member of this project")
    
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if assignee exists and is a project member
    if task.assignee_id:
        assignee_member = db.query(models.ProjectMember).filter(
            models.ProjectMember.project_id == project_id,
            models.ProjectMember.user_id == task.assignee_id
        ).first()
        if not assignee_member:
            raise HTTPException(status_code=400, detail="Assignee must be a project member")
    
    db_task = models.Task(
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        priority=task.priority,
        project_id=project_id,
        assignee_id=task.assignee_id,
        created_by_id=current_user.id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Get assignee name
    assignee_name = None
    if db_task.assignee_id:
        assignee = db.query(models.User).filter(models.User.id == db_task.assignee_id).first()
        assignee_name = assignee.name if assignee else None
    
    return {
        **db_task.__dict__,
        "assignee_name": assignee_name
    }

@router.get("/projects/{project_id}/tasks", response_model=List[schemas.TaskResponse])
def get_project_tasks(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not is_project_member(project_id, current_user.id, db):
        raise HTTPException(status_code=403, detail="Not a member of this project")
    
    tasks = db.query(models.Task).filter(models.Task.project_id == project_id).all()
    
    result = []
    for task in tasks:
        assignee_name = None
        if task.assignee_id:
            assignee = db.query(models.User).filter(models.User.id == task.assignee_id).first()
            assignee_name = assignee.name if assignee else None
        
        result.append({
            **task.__dict__,
            "assignee_name": assignee_name
        })
    
    return result

@router.get("/{task_id}", response_model=schemas.TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if not is_project_member(task.project_id, current_user.id, db):
        raise HTTPException(status_code=403, detail="Not a member of this project")
    
    assignee_name = None
    if task.assignee_id:
        assignee = db.query(models.User).filter(models.User.id == task.assignee_id).first()
        assignee_name = assignee.name if assignee else None
    
    return {
        **task.__dict__,
        "assignee_name": assignee_name
    }

@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    is_admin = is_project_admin(task.project_id, current_user.id, db)
    is_assignee = task.assignee_id == current_user.id
    
    if not is_admin and not is_assignee:
        raise HTTPException(status_code=403, detail="Only admin or assignee can update task")
    
    # Members can only update status, not reassign
    if not is_admin and task_update.assignee_id is not None and task_update.assignee_id != task.assignee_id:
        raise HTTPException(status_code=403, detail="Members cannot reassign tasks")
    
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.due_date is not None:
        task.due_date = task_update.due_date
    if task_update.priority is not None:
        task.priority = task_update.priority
    if task_update.status is not None:
        task.status = task_update.status
    if task_update.assignee_id is not None and is_admin:
        # Check new assignee is project member
        assignee_member = db.query(models.ProjectMember).filter(
            models.ProjectMember.project_id == task.project_id,
            models.ProjectMember.user_id == task_update.assignee_id
        ).first()
        if not assignee_member:
            raise HTTPException(status_code=400, detail="Assignee must be a project member")
        task.assignee_id = task_update.assignee_id
    
    db.commit()
    db.refresh(task)
    
    assignee_name = None
    if task.assignee_id:
        assignee = db.query(models.User).filter(models.User.id == task.assignee_id).first()
        assignee_name = assignee.name if assignee else None
    
    return {
        **task.__dict__,
        "assignee_name": assignee_name
    }

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if not is_project_admin(task.project_id, current_user.id, db):
        raise HTTPException(status_code=403, detail="Only admin can delete tasks")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}