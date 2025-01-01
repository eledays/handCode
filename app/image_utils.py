from app import app

import base64
import cv2
import numpy as np
import os


def base64_to_image(base64_string: str) -> np.ndarray:
    image = base64.b64decode(base64_string.split(',')[1])
    image = np.frombuffer(image, np.uint8)
    image = cv2.imdecode(image, cv2.IMREAD_GRAYSCALE)
    return image


def prepare_image(image: np.ndarray) -> str:
    image = cv2.bitwise_not(image)
    _, image = cv2.threshold(image, 127, 255, cv2.THRESH_BINARY)

    files = list(map(lambda x: int(x.split('.')[0]), os.listdir('app/static/user_images')))
    i = max(files) + 1 if files else 0
    
    cv2.imwrite(f'app/static/user_images/{i}.png', image)
    return f'app/static/user_images/{i}.png'
