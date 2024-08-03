from fastapi import APIRouter
from src.kandinskyAPI.kandinsky_dto import Image, Prompt
import src.kandinskyAPI.kandinsky_service as kandinsky_service
from src.auth.auth_routes import Depends
from src.auth.auth_dependencies import Annotated, get_current_active_user
from src.auth.auth_models import User

kandinskyRouter = APIRouter(
    prefix="/api",
    tags=["Kandinsky"],
)


@kandinskyRouter.post("/kandinsky", summary="Обращение к API Кандинского", description="В тело запроса передаём промпт, в ответ получаем изображение в виде строки Base64")
async def getImage(userPrompt: Prompt, current_user: Annotated[User, Depends(get_current_active_user)]) -> Image:
    return await kandinsky_service.getImage(userPrompt)
