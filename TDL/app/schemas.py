from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class UserBase(BaseModel):
    cognito_id: str
    name: str
    email: str

class Config:
    from_attributes = True  # Atualização para Pydantic V2

class UserResponse(UserBase):
    id: int

class TaskStatus(str, Enum):
    TODO = "To Do"
    IN_PROGRESS = "In Progress"
    DONE = "Done"

class Priority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[Priority] = Priority.MEDIUM
    deadline: datetime

class TaskUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    status: Optional[TaskStatus]
    priority: Optional[Priority]
    deadline: Optional[datetime]

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    priority: Priority
    status: TaskStatus
    deadline: datetime
    owner_id: str  # Ensure this matches the Task model field

    class Config:
        orm_mode = True  # Allows compatibility with SQLAlchemy ORM
