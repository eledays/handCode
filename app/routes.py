from app import app

import base64
import io

from flask import render_template, request, jsonify
from PIL import Image, ImageOps
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

        custom_config = r'--oem 3 --psm 6 -c preserve_interword_spaces=1'
        text = pytesseract.image_to_string(image, lang='eng', config=custom_config)

        with open('temp.txt', 'w') as f:
            f.write(text)

        return jsonify({'text': text}), 200
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500