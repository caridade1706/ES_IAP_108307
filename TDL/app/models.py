from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Boolean 
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


class TaskStatus(PyEnum):
    TODO = "To Do"
    IN_PROGRESS = "In Progress"
    DONE = "Done"

class Priority(PyEnum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)  # Add length to String columns
    description = Column(String(1000), nullable=True)  # Add length here as well
    status = Column(Enum(TaskStatus), default=TaskStatus.TODO)
    priority = Column(String(50), nullable=True)  # Add length for priority
    deadline = Column(DateTime, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="tasks")