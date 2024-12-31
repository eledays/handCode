from app import app

import base64
import io
import traceback

from flask import render_template, request, jsonify
from PIL import Image, ImageOps, ImageDraw, ImageFont
import pytesseract


@app.route('/')
def route():
    return render_template('index.html')


@app.route('/image', methods=['POST'])
def process_image():
    try:
        data = request.json.get('image', None)
        if not data:
            return jsonify({'error': 'No image provided'}), 400
        
        image = base64.b64decode(data.split(',')[1])
        image = Image.open(io.BytesIO(image))

        image = image.convert('L')
        image = ImageOps.invert(image)
        image = image.point(lambda x: 0 if x < 128 else 255, '1')

        image.save('temp.png')

        custom_config = r'--oem 3 --psm 6'
        boxes = pytesseract.image_to_boxes(image, config=custom_config)
        print('boxes', boxes)

        img = image.convert('RGB')
        dr = ImageDraw.Draw(img)
        font = ImageFont.truetype('/home/leo/.local/share/fonts/Manrope-VariableFont_wght.ttf', 20)
        lines = {}
        for i, box in enumerate(boxes.splitlines()):
            box = box.split()
            ch, x, y, x1, y1, *_ = box
            x, y, x1, y1 = map(int, (x, y, x1, y1))

            y, y1 = image.size[1] - y1, image.size[1] - y
            
            pad = 10
            x -= pad
            x1 += pad
            y -= pad
            x1 += pad

            dr.rectangle((x, y, x1, y1), outline='red', width=3)
            dr.text((x + pad, y + pad), ch, fill='red', font=font)

            if y not in lines:
                lines[y] = []
            lines[y].append((x, ch))

        img.save('temp.png')

        sorted_lines = sorted(lines.items(), reverse=False)
        text = ''
        for _, chs in sorted_lines:
            line = ''.join(ch for _, ch in sorted(chs))
            text += line + '\n'

        with open('temp.txt', 'w') as f:
            f.write(text)

        return jsonify({'text': text}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500