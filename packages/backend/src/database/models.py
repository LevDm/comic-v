import datetime
import uuid
from sqlalchemy import Boolean, Column, DateTime, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from src.database.db import Base
from sqlalchemy.dialects.postgresql import UUID


class User(Base):
    __tablename__ = 'users'

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String)
    email = Column(String)
    hashed_password = Column(String)
    access_token = Column(String)
    expires_at = Column(Integer)
    refresh_token = Column(String)
    projects = relationship('Project', cascade='all, delete-orphan')


class Project(Base):
    __tablename__ = 'projects'

    project_id = Column(UUID(as_uuid=True),
                        primary_key=True, default=uuid.uuid4)
    format = Column(String)
    style = Column(String)
    creation_date = Column(DateTime, default=datetime.datetime.now)
    theme = Column(String)
    project_name = Column(String)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id'))
    slides = relationship('Slide', cascade='all, delete-orphan')


association_slide_hero_table = Table('association_slide_hero', Base.metadata,
                                     Column('slide_id', UUID,
                                            ForeignKey('slides.slide_id')),
                                     Column('hero_id', UUID, ForeignKey('heroes.hero_id')))

association_slide_scene_table = Table('association_slide_scene', Base.metadata,
                                      Column('slide_id', UUID,
                                             ForeignKey('slides.slide_id')),
                                      Column('scene_id', UUID, ForeignKey('scenes.scene_id')))


class Slide(Base):
    __tablename__ = 'slides'

    slide_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_number = Column(Integer)
    script = Column(String)
    text_on_shot = Column(String)
    image = Column(String)
    thesis = Column(String)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.project_id'))
    scenes = relationship(
        'Scene', secondary=association_slide_scene_table, cascade='all, delete')
    heroes = relationship(
        'Hero', secondary=association_slide_hero_table, cascade='all, delete')


class Scene(Base):
    __tablename__ = 'scenes'

    scene_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scene_slide_id = Column(String)
    scene_description = Column(String)


class Hero(Base):
    __tablename__ = 'heroes'

    hero_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hero_slide_id = Column(String)
    hero_name = Column(String)
    hero_description = Column(String)
