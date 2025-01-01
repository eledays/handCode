from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

import easyocr
reader = easyocr.Reader(['en'])

from app import routes