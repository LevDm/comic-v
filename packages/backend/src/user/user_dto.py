from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class User(BaseModel):
    full_name: str


class Hero(BaseModel):
    id: str
    name: str
    description: str


class Scene(BaseModel):
    id: str
    description: str


class Slide_from_db(BaseModel):
    script: str
    thesis: str
    text_on_shot: str
    image: str
    heroes: list[str]
    scene: list[str]


class Slide(Slide_from_db):
    order_number: int


class Project(BaseModel):
    format: str
    style: str = 'UHD'
    theme: str
    project_name: str
    user_id: UUID
    heroes_pull: list[Hero]
    scenes_pull: list[Scene]
    slides: list[Slide]


class Project_from_db(Project):
    creation_date: datetime
    slides: list[Slide_from_db]


class Short_slide(BaseModel):
    image: str
    text_on_shot: str


class Users_project(BaseModel):
    project_id: UUID
    format: str
    style: str
    theme: str
    project_name: str
    creation_date: datetime
    count_slides: int
    slides: list[Short_slide]
