try:
    from app import app, reader
except ImportError:
    import easyocr
    reader = easyocr.Reader(['en'])

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


def image_to_code(image: str) -> str:
    blocks = reader.readtext(image)
    print(blocks)

    blocks = sorted(blocks, key=lambda x: x[0][0][1])

    tolerance = 20
    symbol_widths = [(block[0][2][0] - block[0][0][0]) / len(block[1]) for block in blocks]

    last_y = None
    block_lines = []
    for block in blocks:
        if last_y is not None and abs(block[0][0][1] - last_y) <= tolerance:
            block_lines[-1].append(block)
        else:
            block_lines.append([block])
        last_y = block[0][0][1]

    block_lines = [sorted(e, key=lambda x: x[0][0][0]) for e in block_lines]
    lines = [[line[0][0][:2], ' '.join([e[1] for e in line])] for line in block_lines]

    av_symbol_widths = float(sum(symbol_widths) / len(symbol_widths)) if symbol_widths else 0

    for i, line in enumerate(lines[1:], 1):
        tabs = (float(line[0][0][0]) - float(lines[0][0][0][0])) // (av_symbol_widths * 3)
        lines[i][1] = ' ' * (4 * int(tabs)) + line[1]

    lines = [e[1] for e in lines]

    return '\n'.join(lines)


def prepare_text(text: str) -> str:
    BUILTINS = ['print', 'input', 'import', 'int', 'float', 'list', 'tuple', 'set', 'dict', 'def', 'return', 'bool', 'bytes', 'str']
    
    for word in BUILTINS:
        if word in text.lower():
            text = text[:text.lower().find(word)] + word + text[text.lower().find(word) + len(word):]

    return text


if __name__ == '__main__':
    print(prepare_text('''dEFgreeto:
    Print()'''))