from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import Mapped, mapped_column, relationship, MappedAsDataclass, DeclarativeBase
from sqlalchemy import ForeignKey
from typing import List

class Base(DeclarativeBase, MappedAsDataclass):
    pass

db = SQLAlchemy(model_class=Base)

# association tables (stopping many-many relations)

class UserCommunityTask(Base):
    __tablename__ = "user_community_task"

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), primary_key=True, init=True)
    community_task_id: Mapped[int] = mapped_column(ForeignKey("community_task.id", ondelete="CASCADE"), primary_key=True, init=True)
    completed: Mapped[bool] = mapped_column(default=False, init=False)
    
    user: Mapped["User"] = relationship(back_populates="user_community_tasks", init=False)
    community_task: Mapped["CommunityTask"] = relationship(back_populates="user_community_tasks", init=False)

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "community_task_id": self.community_task_id,
            "completed": self.completed,
            "description": self.community_task.description
        }


class CommunityUnlockable(Base):
    __tablename__ = "community_unlockable"

    # records are created when the unlockable is purchase, so unlocked is always True (an oversight in DB design.)

    community_id: Mapped[int] = mapped_column(ForeignKey("community.id", ondelete="CASCADE"), primary_key=True, init=True)
    unlockable_id: Mapped[int] = mapped_column(ForeignKey("unlockable.id", ondelete="CASCADE"), primary_key=True, init=True)
    unlocked: Mapped[bool] = mapped_column(default=True, init=False)
    applied: Mapped[bool] = mapped_column(default=False, init=False)

    community: Mapped["Community"] = relationship(back_populates="community_unlockables", init=False)
    unlockable: Mapped["Unlockable"] = relationship(back_populates="community_unlockables", init=False)

    def to_dict(self):
        return {
            "community_id": self.community_id,
            "unlockable_id": self.unlockable_id,
            "unlocked": self.unlocked,
            "applied": self.applied,
            "unlockable": self.unlockable.to_dict() # not circular
        }
    

# main entities

class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, init=False)
    username: Mapped[str] = mapped_column(unique=True, init=True)
    email: Mapped[str] = mapped_column(unique=True, init=True)
    passhash: Mapped[str] = mapped_column(init=True)
    balance: Mapped[int] = mapped_column(default=0, init=False)
    admin: Mapped[bool] = mapped_column(default=False, init=False)
    community_id: Mapped[int | None] = mapped_column(ForeignKey("community.id"), default=None, init=False)

    user_tasks: Mapped[List["UserTask"]] = relationship(back_populates="user", cascade="all, delete-orphan", init=False)
    user_community_tasks: Mapped[List["UserCommunityTask"]] = relationship(back_populates="user", cascade="all, delete-orphan", init=False)
    community: Mapped["Community"] = relationship(back_populates="users", init=False)
    
    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "balance": self.balance,
            "admin": self.admin,
            "community_id": self.community_id,
            "user_tasks": [task.to_dict() for task in self.user_tasks], # not circular
            "user_community_tasks": [task.to_dict() for task in self.user_community_tasks] # not circular
        }


class UserTask(Base):
    __tablename__ = "user_task"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, init=False)
    description: Mapped[str] = mapped_column(init=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), init=True)
    completed: Mapped[bool] = mapped_column(default=False, init=False)
    
    user: Mapped["User"] = relationship(back_populates="user_tasks", init=False)

    def to_dict(self):
        return {
            "id": self.id,
            "description": self.description,
            "user_id": self.user_id,
            "completed": self.completed
        }


class Community(Base):
    __tablename__ = "community"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, init=False)
    name: Mapped[str] = mapped_column(init=True)
    tier_progress: Mapped[float] = mapped_column(default=0.0, init=False)
    tier: Mapped[int] = mapped_column(default=0, init=False)
    participation: Mapped[float] = mapped_column(default=0.0, init=False)

    users: Mapped[List["User"]] = relationship(back_populates="community", init=False)
    community_tasks: Mapped[List["CommunityTask"]] = relationship(back_populates="community", cascade="all, delete-orphan", init=False)
    community_unlockables: Mapped[List["CommunityUnlockable"]] = relationship(back_populates="community", cascade="all, delete-orphan", init=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "tier_progress": self.tier_progress,
            "tier": self.tier,
            "participation": self.participation,
            "user_usernames": [user.username for user in self.users],
            "unlockables": [unlockable.to_dict() for unlockable in self.community_unlockables] # not circular
        }


class CommunityTask(Base):
    __tablename__ = "community_task"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, init=False)
    description: Mapped[str] = mapped_column(init=True)
    community_id: Mapped[int] = mapped_column(ForeignKey("community.id", ondelete="CASCADE"), init=True)
    
    community: Mapped["Community"] = relationship(back_populates="community_tasks", init=False)
    user_community_tasks: Mapped[List["UserCommunityTask"]] = relationship(back_populates="community_task", cascade="all, delete-orphan", init=False)

    def to_dict(self):
        return {
            "id": self.id,
            "description": self.description,
            "community_id": self.community_id
        }

    
class Unlockable(Base):
    __tablename__ = "unlockable"

    # currently only allows for a single type of unlockable (type of plant), as there is no 'type' field

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, init=False)
    name: Mapped[str] = mapped_column(init=True)
    description: Mapped[str] = mapped_column(init=True)
    price: Mapped[int] = mapped_column(init=True)

    community_unlockables: Mapped[List["CommunityUnlockable"]] = relationship(back_populates="unlockable", cascade="all, delete-orphan", init=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": self.price
        }
