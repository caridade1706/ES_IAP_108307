# task_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import TaskCreate, TaskResponse
from app.models import Task, User, TaskStatus
from app.services.auth_service import get_current_user


router = APIRouter()

@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task: TaskCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # Get cognito_id from the current user
    cognito_id = user.cognito_id  # Use cognito_id directly

    # Create and save the new task with the user's cognito_id as owner_id
    new_task = Task(
        title=task.title,
        description=task.description,
        deadline=task.deadline,
        priority=task.priority,
        status=TaskStatus.TODO,
        owner_id=cognito_id
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.get("/tasks", response_model=list[TaskResponse])
def get_tasks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # Get tasks only for the authenticated user
    tasks = db.query(Task).filter(Task.owner_id == user.cognito_id).all()
    return tasks


@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    # Retrieve the task from the database
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    # Check if the authenticated user is the creator of the task
    user_cognito_id = user.get("sub")  # Assuming "sub" from Cognito represents the user's unique identifier
    if task.owner_id != user_cognito_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this task")
    
    return task