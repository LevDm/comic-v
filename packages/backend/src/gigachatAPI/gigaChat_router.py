from fastapi import APIRouter
from src.gigachatAPI.models.payload import Screenplay, Scene, Theses, FrameText, ThesisRequest
from src.gigachatAPI.gigaChat_service import Chat
from src.gigachatAPI.json_strings import remove_spaces_and_special_chars
from src.auth.auth_routes import Depends
from src.auth.auth_dependencies import Annotated, get_current_active_user
from src.auth.auth_models import User

GigaChatRouter = APIRouter(
    prefix="/api",
    tags=["GigaChat"],
)


@GigaChatRouter.post("/gigachat/theses", summary="Получение тезисов для комикса")
def get_theses(Json: Theses, current_user: Annotated[User, Depends(get_current_active_user)]):
    token = Chat.get_token()
    user_content = f'Ваша задача - требуется придумать и написать три тезиса (начало, середина, конец) для сценария комикса на тему: {
        Json.theme}.'
    content_content = '''Ты — сценарист комиксов, который уже придумал тему.
    1.  Обязательно ответ отправить в виде JSON, формата {"theses": ["Сгенерированный_тезис_начало", "Сгенерированный_тезис_середина", "Сгенерированный_тезис_конец"]
    2. Будьте креативными и подумайте о потенциальных сюжетных поворотах, уникальных персонажах или инновационных идеях,
    которые могут привлечь внимание читателей. Используйте яркие образы, сильные эмоции и неожиданные сюжетные ходы,
    чтобы сделать ваши тезисы более захватывающими и запоминающимися.
    3. Каждый тезис должен быть одним предложением.
    '''
    answer = Chat.get_chat_answer(token, user_content, content_content)[
        'choices'][0]['message']['content']
    return remove_spaces_and_special_chars(answer)


@GigaChatRouter.post("/gigachat/scene_hero", summary="Получение описания сцены и героев")
def get_scene_hero(Json: Scene, current_user: Annotated[User, Depends(get_current_active_user)]):
    token = Chat.get_token()
    user_content = f'''Ваша задача — придумать {len(Json.theses)} элементов пейзажа для комикса (scenes_pull), а также героев или действующих лиц (имена и описания)(heroes_pull) для комикса на тему {
        Json.theme}, используя следующие тезисы истории: {" ".join(Json.theses)}.'''
    content_content = '''Вы — сценарист комиксов. 
    1. Обязательно отправьте ваш ответ в виде JSON, 
    содержащего описание сцены и героев в следующем формате: {"scenes_pull": ["описание_элементов_пейзажа"], 
                                                              "heroes_pull": [{"name": "имя_героя", "description": "описание_героя"}]}   
    2. При добавлении героя в (heroes_pull) пулл героев убедитесь, что они являются реальными персонажами или действующими явлениями. 
    3. Если герой упоминается в теме или тезисах, то необходимо использовать его.
    4. Если не хватает информации о герое, генерируйте ее самостоятельно. 
    5. Описывай каждый элемент пейзажа окружающей среды эпитетами, раскрывайте их  свойства.
    6. Не добавляйте в scenes_pull имена героев.
    '''
    answer = Chat.get_chat_answer(token, user_content, content_content)[
        'choices'][0]['message']['content']
    return remove_spaces_and_special_chars(answer)


@GigaChatRouter.post("/gigachat/screenplay", summary="Получение сценария кадра комикса")
def get_screenplay(Json: Screenplay, current_user: Annotated[User, Depends(get_current_active_user)]):
    token = Chat.get_token()

    user_content = f'Ваша задача — написать сценарий для одного кадра комикса, используя тему: {Json.theme} и главную мысль кадра: {Json.theses}.'
    content_content = '''Вы — сценарист комиксов. 
    1. Сценарий должен дополнять и расширять главную мысль кадра в рамках заданной темы.
    2. Сценарий не должен содержать действий, которые не затронуты в главной мысли кадра.
    3. Сценарий должен состоять маскимум из 3 предложений.
    4. Сценарий должен состоять максимум из 320 символов.
    '''
    answer = Chat.get_chat_answer(token, user_content, content_content)['choices'][0]['message']['content']
    return {"screenplay": remove_spaces_and_special_chars(answer)}


@GigaChatRouter.post("/gigachat/frame_text", summary="Получение текста кадра на основе сценария")
def generate_frame_text(Json: FrameText, current_user: Annotated[User, Depends(get_current_active_user)]):
    token = Chat.get_token()
    user_content = f'Ваша задача — написать текст для кадра комикса, используя сценарий - {Json.screenplay}'
    content_content = '''Вы — сценарист комиксов. Вам предстоит создать текст кадра, который заинтригует читателей и заставит их узнавать, что произойдет дальше.
    Текст должен содержать максимум 25 слов. 
    '''
    answer = Chat.get_chat_answer(token, user_content, content_content)['choices'][0]['message']['content']
    return {"frame_text": remove_spaces_and_special_chars(answer)}


@GigaChatRouter.post("/gigachat/thesis_generation", summary="Получение тезиса на основе темы и предыдущего/последующего тезиса")
def get_thesis_generation(Json: ThesisRequest, current_user: Annotated[User, Depends(get_current_active_user)]):
    token = Chat.get_token()

    # Ситуация 1: Есть тема, но нет предыдущего и последующего тезисов
    if not Json.previous_thesis and not Json.next_thesis:
        user_content = f'''Напишите новый тезис на основе темы "{
            Json.theme}".'''
    elif not Json.previous_thesis:  # Ситуация 2: Есть тема ,но нет предыдущего тезиса
        user_content = f'''Напишите новый тезис о событиях, предшествующих тезису "{
            Json.next_thesis}", и на основе темы "{Json.theme}".'''
    elif not Json.next_thesis:  # Ситуация 3: Есть тема, но нет последующего тезиса
        user_content = f'''Напишите новый тезис о событиях, следующих за тезисом "{
            Json.previous_thesis}", и на основе темы "{Json.theme}".'''
    else:  # Ситуация 4: Есть тема, а также предыдущий и последующий тезисы
        user_content = f'''Напишите новый тезис о событиях, происходящих между тезисом "{
            Json.previous_thesis}" и тезисом "{Json.next_thesis}", и на основе темы "{Json.theme}".'''

    content_content = '''Вы — сценарист комиксов.
    1. Будьте креативными и подумайте о потенциальных сюжетных поворотах, уникальных персонажах или инновационных идеях,
    которые могут привлечь внимание читателей. Используйте яркие образы, сильные эмоции и неожиданные сюжетные ходы,
    чтобы сделать ваш тезис более захватывающими и запоминающимися.
    2. Обязательно используйте главного героя и не заменяйте его местоимениями (он, она, они и т.д.).
    3. Тезис должен быть одним предложением.
    '''

    answer = Chat.get_chat_answer(token, user_content, content_content)['choices'][0]['message']['content']
    return {"thesis": remove_spaces_and_special_chars(answer)}
