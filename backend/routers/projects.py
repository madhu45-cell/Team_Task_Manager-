from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db
from auth import get_current_user
from dependencies import is_project_admin, is_project_member

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.post("/", response_model=schemas.ProjectResponse)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_project = models.Project(
        name=project.name,
        description=project.description,
        creator_id=current_user.id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    # Add creator as admin member
    member = models.ProjectMember(
        project_id=db_project.id,
        user_id=current_user.id,
        role=models.UserRole.ADMIN
    )
    db.add(member)
    db.commit()
    
    return db_project

@router.get("/", response_model=List[schemas.ProjectResponse])
def get_user_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Get projects where user is a member
    projects = db.query(models.Project).join(
        models.ProjectMember
    ).filter(
        models.ProjectMember.user_id == current_user.id
    ).all()
    
    # Add user's role to response
    result = []
    for project in projects:
        member = db.query(models.ProjectMember).filter(
            models.ProjectMember.project_id == project.id,
            models.ProjectMember.user_id == current_user.id
        ).first()
        project_dict = {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "creator_id": project.creator_id,
            "created_at": project.created_at,
            "role": member.role.value if member else None
        }
        result.append(project_dict)
    
    return result

@router.get("/{project_id}", response_model=schemas.ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not is_project_member(project_id, current_user.id, db):
        raise HTTPException(status_code=403, detail="Not a member of this project")
    
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    member = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == current_user.id
    ).first()
    
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "creator_id": project.creator_id,
        "created_at": project.created_at,
        "role": member.role.value if member else None
    }

@router.put("/{project_id}", response_model=schemas.ProjectResponse)
def update_project(
    project_id: int,
    project_update: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not is_project_admin(project_id, current_user.id, db):
        raise HTTPException(status_code=403, detail="Only admin can update project")
    
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project_update.name is not None:
        project.name = project_update.name
    if project_update.description is not None:
        project.description = project_update.description
    
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only project creator can delete project")
    
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}

@router.get("/{project_id}/members", response_model=List[schemas.MemberResponse])
def get_project_members(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not is_project_member(project_id, current_user.id, db):
        raise HTTPException(status_code=403, detail="Not a member of this project")
    
    members = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id
    ).all()
    
    result = []
    for member in members:
        user = db.query(models.User).filter(models.User.id == member.user_id).first()
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": member.role.value,
            "joined_at": member.joined_at
        })
    
    return result

@router.post("/{project_id}/members")
def add_member(
    project_id: int,
    member_data: schemas.AddMember,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not is_project_admin(project_id, current_user.id, db):
        raise HTTPException(status_code=403, detail="Only admin can add members")
    
    user = db.query(models.User).filter(models.User.email == member_data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    existing = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User already a member")
    
    new_member = models.ProjectMember(
        project_id=project_id,
        user_id=user.id,
        role=member_data.role
    )
    db.add(new_member)
    db.commit()
    
    return {"message": f"User {user.name} added to project"}

@router.delete("/{project_id}/members/{user_id}")
def remove_member(
    project_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not is_project_admin(project_id, current_user.id, db):
        raise HTTPException(status_code=403, detail="Only admin can remove members")
    
    member = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == user_id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    if member.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself")
    
    db.delete(member)
    db.commit()
    
    return {"message": "Member removed successfully"}