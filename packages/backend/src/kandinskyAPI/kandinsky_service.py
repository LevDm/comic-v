import json
import random
import time
import requests
from src.kandinskyAPI.kandinsky_default import imageeees, yacub

from src.kandinskyAPI.kandinsky_dto import Image, Prompt


class Text2ImageAPI:
    def __init__(self, url, keys):
        self.URL = url
        self.AUTH_HEADERS = {
            'X-Key': f'Key {keys[0]}',
            'X-Secret': f'Secret {keys[1]}',
        }

    def get_model(self):
        response = requests.get(self.URL + 'key/api/v1/models', headers=self.AUTH_HEADERS)
        data = response.json()
        return data[0]['id']

    def generate(self, prompt, model, style, images=1, width=1024, height=1024):
        params = {
            "type": "GENERATE",
            "style": style,
            "numImages": images,
            "width": width,
            "height": height,
            "generateParams": {
                "query": f"{prompt}"
            }
        }

        data = {
            'model_id': (None, model),
            'params': (None, json.dumps(params), 'application/json')
        }
        response = requests.post(self.URL + 'key/api/v1/text2image/run', headers=self.AUTH_HEADERS, files=data)
        data = response.json()
        try:
            res = data['uuid']
        except:
            res = 404
        return res

    def check_generation(self, request_id, attempts=10, delay=10):
        while attempts > 0:
            try:
                response = requests.get(self.URL + 'key/api/v1/text2image/status/' +
                                        request_id, headers=self.AUTH_HEADERS)
                data = response.json()
                if data['status'] == 'DONE':
                    if data['censored'] == True:
                        return ['']
                    return data['images']

                attempts -= 1
                time.sleep(delay)
            except:
                return 404
        return 404


api_keys = [('05032E83D0FF31DD22DAF7B878714802', '4F8EB0952CC4584F69B75DDBC9BAC770'),
            ('A50C6524128D5B3FD0CDCB0961DBE52F', 'EB8DE52A357B39B5455381F0C34BDD01'),
            ('91D4A2DC69946689C6CDA2CD633289BD', '7E9F4B3BA741F6757039535E3A05F5CA'),
            ('3DE2F24BAD02B4B3E18253536BB3D362', 'B11BB6C3A72031D7D6A43E887498AA39'),
            ('CDDFF1D6E46CF4DB37CFFCFF53483362', 'F5DD1481E214BAB486CD374A7D2B1692'),
            ('30AEF911C4BADC87C33E69D826F979E5', '2C6102EF0E1DB1F0245962C81E5FFCAB'),
            ('A7C5742361F5228E04974F0A23AFE267', 'AC983F3C1E177B9DD49602F394A5AE27'),
            ('513FDB919A82E12C77759B05B3D42842', 'CFFC58F0310D67A1AD6EB951C2295F83'),
            ('618EB35E6005061B1B072B03424F62CC', 'EB78E0E818C6883BCA171B523F73986B'),
            ('BDBE96BF85ACAECD2B4B1778AEAEB4BB', '39B6911E239839FF96ED9A8EDAF133F2')]


async def getImage(userPrompt: Prompt) -> Image:
    if userPrompt.script == 'АллоВрач?':
        return {"imageBase64": imageeees}
    if userPrompt.theme != '':
        prompt = 'Нарисуй картинку. Используй сценарий: ' + userPrompt.script + '. ' + 'Опирайся на тему: ' + userPrompt.theme
    else:
        prompt = 'Нарисуй картинку по сценарию: ' + userPrompt.script + '. '

    if len(userPrompt.scene) != 0 and len(userPrompt.heroes) != 0:
        prompt += 'Используй описания героев: '
        for i in range(len(userPrompt.heroes)):
            prompt += f'{userPrompt.heroes[i].name} - {userPrompt.heroes[i].description}'
            if i != len(userPrompt.heroes) - 1:
                prompt += '; '
            else:
                prompt += '. '

        prompt += 'Используй следующие детали: '
        for i in range(len(userPrompt.scene)):
            prompt += userPrompt.scene[i]
            if i != len(userPrompt.scene) - 1:
                prompt += '; '
            else:
                prompt += '. '

    elif len(userPrompt.scene) == 0 and len(userPrompt.heroes) != 0:
        prompt += 'Используй описания героев: '
        for i in range(len(userPrompt.heroes)):
            prompt += f'{userPrompt.heroes[i].name} - {userPrompt.heroes[i].description}'
            if i != len(userPrompt.heroes) - 1:
                prompt += '; '
            else:
                prompt += '. '

    elif len(userPrompt.scene) != 0 and len(userPrompt.heroes) == 0:
        prompt += 'Используй следующие детали: '
        for i in range(len(userPrompt.scene)):
            prompt += userPrompt.scene[i]
            if i != len(userPrompt.scene) - 1:
                prompt += '; '
            else:
                prompt += '. '

    width, height = userPrompt.format.split('/')
    width = int(width)
    height = int(height)
    max_board = max(height, width)
    one_part = int(1024 / max_board)
    pix_width = width * one_part
    pix_height = height * one_part

    images = 404
    while images == 404:
        api = Text2ImageAPI('https://api-key.fusionbrain.ai/', random.choice(api_keys))
        model_id = api.get_model()
        uuid = api.generate(prompt, model_id, userPrompt.style, width=pix_width, height=pix_height)
        if uuid == 404:
            return {"imageBase64": yacub}
        images = api.check_generation(uuid)

    return {"imageBase64": images[0]}
