# task_routes.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import TaskCreate, TaskResponse, TaskUpdate
from app.models import Task, User, TaskStatus, Priority
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

@router.get("/tasks", response_model=dict)
def get_tasks(
    db: Session = Depends(get_db),
    status: str = Query(None, description="Status da tarefa (To Do, In Progress, Done)"),
    priority: str = Query(None, description="Prioridade da tarefa (Low, Medium, High)"),
    page: int = Query(1, ge=1, description="Número da página"),
    limit: int = Query(10, ge=1, description="Número de itens por página"),
    user: dict = Depends(get_current_user)
    
):
    user_cognito_id = user.cognito_id  # Assumindo que "sub" contém o ID único do usuário

    # Construir a query inicial filtrando pelo `owner_id`
    query = db.query(Task).filter(Task.owner_id == user_cognito_id)
    
    # Aplicar filtros de status e prioridade, se fornecidos
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)

    # Calcular a paginação
    total_tasks = query.count()
    total_pages = (total_tasks + limit - 1) // limit  # Número total de páginas
    offset = (page - 1) * limit

    tasks = query.offset(offset).limit(limit).all()

    # Converte cada `Task` do SQLAlchemy para o esquema Pydantic `TaskResponse`
    tasks_response = [TaskResponse.from_orm(task) for task in tasks]

    return {
        "tasks": tasks_response,
        "totalPages": total_pages,
        "currentPage": page
    }


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


@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Retrieve the task from the database
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    # Check if the authenticated user is the owner of the task
    if task.owner_id != user.cognito_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to update this task")

    # Update task fields without converting enums to strings
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.status is not None:
        task.status = TaskStatus(task_update.status)  # Directly use Enum without .value
    if task_update.priority is not None:
        task.priority = Priority(task_update.priority)  # Directly use Enum without .value
    if task_update.deadline is not None:
        task.deadline = task_update.deadline

    db.commit()
    db.refresh(task)
    return task

# Delete a task
@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # Retrieve the task from the database
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    # Check if the authenticated user is the owner of the task
    if task.owner_id != user.cognito_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to delete this task")

    db.delete(task)
    db.commit()
    return None


