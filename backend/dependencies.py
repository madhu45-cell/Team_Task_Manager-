from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import models
from auth import get_current_user

def get_project_member_role(project_id: int, user_id: int, db: Session):
    member = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == user_id
    ).first()
    return member.role if member else None

def is_project_admin(project_id: int, user_id: int, db: Session):
    member = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == user_id
    ).first()
    if not member:
        return False
    return member.role == models.UserRole.ADMIN

def is_project_member(project_id: int, user_id: int, db: Session):
    member = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == user_id
    ).first()
    return member is not None

async def get_current_user_with_projects(current_user: models.User = Depends(get_current_user)):
    return current_user