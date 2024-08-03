import random
import uuid
import requests


tokens = ('ZmZlNDhhZjctYmE0MC00YTkyLTgxZTQtOTRlMmY0YjRjYTFhOjAzMWJkZjllLWQ0Y2QtNDAyMi1iNjg5LWM5MWZjNTZlNjU0Mg==',
          'ZDE4ZTlhOWYtOGQ1My00ODdiLTllMDctYjYzZjdiOWJmMTI1OjE4YTNmMDgxLWEwZjktNDVjYy04MWU3LWFjYzBhMjdjZDk5ZA==',
          'ZDU2Yzg4MmUtMjExNS00Zjk5LWExNTktZjY5MjhiNWZlODIzOjk0NjJjYmI2LTYwZjgtNDU2YS04NmZkLTAwNjEyYzA3ZWM4OA==',
          'NjM4OTU0NmMtMjIzNS00MzlmLWE2OWEtODA3ZTJiMWYxZGE1OmE1NDMzZWU0LTViNWYtNGI0MC04YTA0LTAxMGE5Zjg0ZTQ5NA==',
          'YTIwODE5ZGUtNWRiYS00NzViLTkzMGEtYjcyNWU0MjkyNDM0OjJmODYwOTQ3LTNjZTItNGJkNS04NjYyLTk2ZjkwNjk4YzYyMA==')


class GigaChat:
    def __init__(self):
        self.token = None
        self.token_expiration_time = None

    def get_token(self):
        while True:
            try:
                key = random.choice(tokens)
                response = self.get_chat_completion(key)
                if response == -1:
                    raise Exception("Ошибка при получении токена")
                self.token = response.json()['access_token']
                return self.token
            except:
                pass

    def get_chat_completion(self, auth_token, scope='GIGACHAT_API_PERS'):
        """
        Выполняет POST-запрос к эндпоинту, который выдает токен.

        Параметры:
        - auth_token (str): токен авторизации, необходимый для запроса.
        - область (str): область действия запроса API. По умолчанию — «GIGACHAT_API_PERS».

        Возвращает:
        - ответ API, где токен и срок его "годности".
        """
        # Создадим идентификатор UUID (36 знаков)
        rq_uid = str(uuid.uuid4())

        # API URL
        url = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"

        # Заголовки
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'RqUID': rq_uid,
            'Authorization': f'Basic {auth_token}'
        }

        # Тело запроса
        payload = {
            'scope': scope
        }
        try:
            # Делаем POST запрос с отключенной SSL верификацией
            # (можно скачать сертификаты Минцифры, тогда отключать проверку не надо)
            response = requests.post(
                url, headers=headers, data=payload, verify=False)
            return response
        except requests.RequestException as e:
            print(f"Ошибка: {str(e)}")
            return -1

    def get_chat_answer(self, auth_token, user_content, content_content):
        url = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions"
        payload = {
            "model": "GigaChat",
            "messages": [
                {
                    "role": "system",
                    "content": content_content
                },
                {
                    "role": "user",
                    "content": user_content
                }
            ]
        }
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': f'Bearer {auth_token}'
        }
        try:
            response = requests.post(
                url, headers=headers, json=payload, verify=False)
            response.raise_for_status()  # Если статус ответа не 200, выбросить исключение
            return response.json()  # Возвращаем ответ в виде объекта Python
        except requests.RequestException as e:
            print(f"Произошла ошибка: {str(e)}")
            return -1


Chat = GigaChat()
