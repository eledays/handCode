from app import app, reader
from app.image_utils import base64_to_image, prepare_image

import traceback
import os

from flask import render_template, request, jsonify


@app.route('/')
def route():
    return render_template('index.html')


@app.route('/image', methods=['POST'])
def process_image():
    try:
        data = request.json.get('image', None)
        if not data:
            return jsonify({'error': 'No image provided'}), 400
        
        image = base64_to_image(data)
        image = prepare_image(image)

        result = reader.readtext(image)

        os.remove(image)
        text = [e[1] for e in result]
        
        return jsonify({'text': text}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500