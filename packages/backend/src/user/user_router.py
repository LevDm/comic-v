from typing import Annotated
from fastapi import APIRouter, Path
from fastapi.responses import StreamingResponse
from uuid import UUID
import src.database.models as models
from src.database.db import db_dependency
from src.user.user_dto import Hero, Project_from_db, Scene, Short_slide, Slide_from_db, User, Project, Users_project
from src.auth.auth_routes import Depends
from src.auth.auth_dependencies import Annotated, get_current_active_user
from src.auth.auth_models import User
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph,  Image
from reportlab.lib.styles import getSampleStyleSheet
from PIL import Image as PILImage
from base64 import b64decode
import io
import zipfile
from PIL import Image, ImageDraw, ImageFont

userRouter = APIRouter(
    prefix="/api",
    tags=["User"],
)


@userRouter.post("/user/project", summary="Сохранение проекта")
async def save_project(project_json: Project, db: db_dependency, current_user: Annotated[User, Depends(get_current_active_user)]):
    heroes_pull = []
    for hero in project_json.heroes_pull:
        db_hero = models.Hero(hero_slide_id=hero.id,
                              hero_name=hero.name,
                              hero_description=hero.description)
        db.add(db_hero)
        heroes_pull.append(db_hero)

    scenes_pull = []
    for scene in project_json.scenes_pull:
        db_scene = models.Scene(scene_slide_id=scene.id,
                                scene_description=scene.description)
        db.add(db_scene)
        scenes_pull.append(db_scene)

    slides = []
    for slide in project_json.slides:
        db_slide = models.Slide(order_number=slide.order_number,
                                script=slide.script,
                                text_on_shot=slide.text_on_shot,
                                image=slide.image,
                                thesis=slide.thesis,
                                heroes=[
                                    hero for hero in heroes_pull if hero.hero_slide_id in slide.heroes],
                                scenes=[scene for scene in scenes_pull if scene.scene_slide_id in slide.scene])
        db.add(db_slide)
        slides.append(db_slide)

    db_project = models.Project(format=project_json.format,
                                style=project_json.style,
                                theme=project_json.theme,
                                project_name=project_json.project_name,
                                user_id=project_json.user_id,
                                slides=slides)
    db.add(db_project)
    db.commit()
    return {"project_id": db_project.project_id}


@userRouter.delete("/user/project/{project_id}", summary="Удаление проекта")
async def delete_project(project_id: Annotated[UUID, Path(description='Project ID in the uuid4 format', example='6c4067b2-efef-474e-a72f-1ac74a5c6c51')], db: db_dependency, current_user: Annotated[User, Depends(get_current_active_user)]):
    db.delete(db.query(models.Project).filter(
        models.Project.project_id == project_id).first())
    db.commit()


@userRouter.put("/user/project/{project_id}", summary="Пересохранение проекта")
async def edit_project(project_json: Project, project_id: Annotated[UUID, Path(description='Project ID in the uuid4 format', example='6c4067b2-efef-474e-a72f-1ac74a5c6c51')], db: db_dependency, current_user: Annotated[User, Depends(get_current_active_user)]):
    project = db.query(models.Project).filter(models.Project.project_id == project_id).first()
    if not project:
        return {"error": "Project not found"}

    db.delete(project)
    db.commit()
    heroes_pull = []
    for hero in project_json.heroes_pull:
        db_hero = models.Hero(hero_slide_id=hero.id,
                              hero_name=hero.name,
                              hero_description=hero.description)
        db.add(db_hero)
        heroes_pull.append(db_hero)

    scenes_pull = []
    for scene in project_json.scenes_pull:
        db_scene = models.Scene(scene_slide_id=scene.id,
                                scene_description=scene.description)
        db.add(db_scene)
        scenes_pull.append(db_scene)

    slides = []
    for slide in project_json.slides:
        db_slide = models.Slide(order_number=slide.order_number,
                                script=slide.script,
                                text_on_shot=slide.text_on_shot,
                                image=slide.image,
                                thesis=slide.thesis,
                                heroes=[
                                    hero for hero in heroes_pull if hero.hero_slide_id in slide.heroes],
                                scenes=[scene for scene in scenes_pull if scene.scene_slide_id in slide.scene])
        db.add(db_slide)
        slides.append(db_slide)

    db_project = models.Project(format=project_json.format,
                                style=project_json.style,
                                theme=project_json.theme,
                                project_name=project_json.project_name,
                                user_id=project_json.user_id,
                                slides=slides,
                                project_id=project_id)
    db.add(db_project)
    db.commit()


@userRouter.get("/user/{user_id}/projects", summary="Получение списка проектов пользователя из базы данных")
async def get_user_projects(user_id: Annotated[UUID, Path(description='User ID in the uuid4 format', example='6c4067b2-efef-474e-a72f-1ac74a5c6c51')], db: db_dependency, current_user: Annotated[User, Depends(get_current_active_user)]):
    db_projects = db.query(models.Project.project_id, models.Project.theme,
                           models.Project.project_name, models.Project.creation_date, models.Project.format, models.Project.style).filter(models.Project.user_id == user_id).all()
    projects = []
    for project in db_projects:
        db_slides = db.query(models.Slide.image, models.Slide.text_on_shot).filter(
            models.Slide.project_id == project[0]).order_by(models.Slide.order_number).all()

        slides = []
        if len(db_slides) >= 3:
            slides = [Short_slide(image=db_slides[i][0], text_on_shot=db_slides[i][1]) for i in (
                0, int(len(db_slides) / 2), len(db_slides) - 1)]
        elif len(db_slides) == 2:
            slides = [Short_slide(image=db_slides[i][0],
                                  text_on_shot=db_slides[i][1]) for i in (0, 1)]
        elif len(db_slides) == 1:
            slides = [Short_slide(image=db_slides[0][0],
                                  text_on_shot=db_slides[0][1])]

        projects.append(Users_project(
            project_id=project[0], theme=project[1], project_name=project[2], creation_date=project[3], format=project[4], style=project[5], count_slides=len(db_slides), slides=slides))

    return projects


@userRouter.get("/user/project/{project_id}/slides", summary="Получение слайдов проекта для предпросмотра из базы данных")
async def get_project_slides(project_id: Annotated[UUID, Path(description='Project ID in the uuid4 format', example='6c4067b2-efef-474e-a72f-1ac74a5c6c51')], db: db_dependency, current_user: Annotated[User, Depends(get_current_active_user)]):
    db_slides = db.query(models.Slide.image, models.Slide.text_on_shot).filter(
        models.Slide.project_id == project_id).order_by(models.Slide.order_number).all()
    slides = []
    for slide in db_slides:
        slides.append(Short_slide(image=slide[0], text_on_shot=slide[1]))
    return slides


@userRouter.get("/user/project/{project_id}", summary="Получение всего проекта из базы данных")
async def get_project(project_id: Annotated[UUID, Path(description='Project ID in the uuid4 format', example='6c4067b2-efef-474e-a72f-1ac74a5c6c51')], db: db_dependency, current_user: Annotated[User, Depends(get_current_active_user)]):
    db_project = db.query(models.Project.format, models.Project.creation_date, models.Project.theme, models.Project.project_name, models.Project.user_id, models.Project.style).filter(
        models.Project.project_id == project_id).first()

    db_slides = db.query(models.Slide).filter(
        models.Slide.project_id == project_id).order_by(models.Slide.order_number).all()

    slides = []
    heroes = set()
    scenes = set()
    for slide in db_slides:
        for hero in slide.heroes:
            heroes.add(hero)
        for scene in slide.scenes:
            scenes.add(scene)

        slides.append(Slide_from_db(script=slide.script,
                      image=slide.image, thesis=slide.thesis, text_on_shot=slide.text_on_shot, heroes=[hero.hero_slide_id for hero in slide.heroes], scene=[scene.scene_slide_id for scene in slide.scenes]))

    heroes_list = []
    for hero in heroes:
        heroes_list.append(Hero(id=hero.hero_slide_id,
                           name=hero.hero_name, description=hero.hero_description))

    scenes_list = []
    for scene in scenes:
        scenes_list.append(
            Scene(id=scene.scene_slide_id, description=scene.scene_description))

    return Project_from_db(format=db_project[0],
                           creation_date=db_project[1],
                           theme=db_project[2],
                           project_name=db_project[3],
                           user_id=db_project[4],
                           style=db_project[5],
                           slides=slides,
                           heroes_pull=heroes_list,
                           scenes_pull=scenes_list)


@userRouter.get("/user/download_comic/{project_id}", summary="Скачивание комикса")
async def download_comic(project_id: Annotated[UUID, Path(description='Project ID in the uuid4 format', example='6c4067b2-efef-474e-a72f-1ac74a5c6c51')], db: db_dependency, current_user: Annotated[User, Depends(get_current_active_user)]):
    # Получаем проект из базы данных
    project = db.query(models.Project).filter(models.Project.project_id == project_id).first()

    # Если проект не найдем возвращаем ошибку
    if not project:
        return {"error": "Project not found"}

    slides = db.query(models.Slide).filter(models.Slide.project_id == project_id).order_by(models.Slide.order_number).all()
    buffer = io.BytesIO()
    i = 0
    with zipfile.ZipFile(buffer, 'w') as zf:
        for slide in slides:
            img_bytes = b64decode(slide.image)
            img = Image.open(io.BytesIO(img_bytes))
            draw = ImageDraw.Draw(img)

            # Установите шрифт и размер текста
            font = ImageFont.truetype("arial.ttf", 22)  # /usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf
            # Установите позицию текста
            text_position = (img.width/2, 4/5*img.height)

            background = Image.new('RGBA', (img.width, int(1/5*img.height)+10), (0, 0, 0, 128))
            img.paste(background, (0, int(4/5*img.height)-10), background)

            # Добавьте текст на изображение
            text = slide.text_on_shot  # Текст для добавления
            sentences = text.split('. ')  # Разбиваем текст на предложения
            y_text = text_position[1]
            line_spacing = 1.2  # Отступ между строками

            for sentence in sentences:
                if sentence:
                    words = sentence.split()
                    current_line = []
                    for word in words:
                        test_line = ' '.join(current_line + [word])
                        test_width = draw.textlength(test_line, font=font)
                        if test_width <= img.width:
                            current_line.append(word)
                        else:
                            if current_line:
                                draw.text((img.width/2 - draw.textlength(' '.join(current_line), font=font) /
                                          2, y_text), ' '.join(current_line), font=font, fill=(255, 255, 255))
                                y_text += font.size * line_spacing
                            current_line = [word]
                    if current_line:
                        draw.text((img.width/2 - draw.textlength(' '.join(current_line), font=font)/2, y_text), ' '.join(current_line), font=font, fill=(255, 255, 255))
                        y_text += font.size * line_spacing

            img_bytes = io.BytesIO()
            img.save(img_bytes, format='JPEG')
            img_bytes.seek(0)
            # Сохраняем изображение в ZIP-архив
            zf.writestr(f"slide_{slide.project_id}_{i}.jpg", img_bytes.read())
            i += 1

    buffer.seek(0)
    filename = f"project_{project_id}.zip"
    headers = {"Content-Disposition": f"attachment; filename={filename}"}
    return StreamingResponse(iter([buffer.read()]), media_type="application/zip", headers=headers)
