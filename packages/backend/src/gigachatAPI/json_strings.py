import json


def remove_spaces_and_special_chars(input_string):
    try:
        json_obj = json.loads(input_string)
        return json_obj
    except json.JSONDecodeError:
        return input_string
