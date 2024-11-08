from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
from enum import Enum as PyEnum
import datetime

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    cognito_id = Column(String(255), index=True, unique=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)

    # Add the relationship to tasks
    tasks = relationship("Task", back_populates="owner")


class TaskStatus(PyEnum):
    TODO = "ToDo"
    IN_PROGRESS = "In_Progress"
    DONE = "Done"

class Priority(PyEnum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    description = Column(String(1000), nullable=True)
    status = Column(Enum(TaskStatus), default=TaskStatus.TODO)
    priority = Column(Enum(Priority), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)  # Track last update
    deadline = Column(DateTime, nullable=True)
    owner_id = Column(String(255), ForeignKey("users.cognito_id"))  # Use cognito_id as the foreign key

    owner = relationship("User", back_populates="tasks")
