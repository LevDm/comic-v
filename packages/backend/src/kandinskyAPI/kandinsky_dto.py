from pydantic import BaseModel


class Hero(BaseModel):
    name: str
    description: str


class Prompt(BaseModel):
    format: str = '4/3'
    style: str = 'UHD'
    theme: str = ''
    script: str = 'Кошка перебегает дорогу льву'
    scene: list[str] = ['степная дорога', 'яркое солнце']
    heroes: list[Hero] = [{'name': 'Лев', 'description': 'большой хищник с красивой гривой'},
                          {'name': 'Кошка', 'description': 'маленькая черная'}]


class Image(BaseModel):
    imageBase64: str
