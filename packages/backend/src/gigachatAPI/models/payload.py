from pydantic import BaseModel
from typing import Optional


class Payload(BaseModel):
    pass


class Scene(Payload):
    theme: str = "Лев делает проект по программированию"
    theses: list[str] = [
        "Лев, талантливый программист, начинает свой первый проект.",
        "Лев сталкивается с трудностями при написании кода, но не сдается.",
        "Лев успешно завершает свой проект, вдохновляя окружающих на новые достижения."]


class Screenplay(Payload):
    theme: str = ""
    theses: str = "Лев, талантливый программист, начинает свой первый проект."


class Theme(Payload):
    pass


class Theses(Payload):
    theme: str = "Лев делает проект по программированию"


class FrameText(Payload):
    screenplay: str = "Лев, молодой талантливый программист, сосредоточенно работает над своим первым проектом"


class ThesisRequest(Payload):
    theme: str = "Лев делает проект по программированию"
    previous_thesis: Optional[str] = ""
    next_thesis: Optional[str] = ""
