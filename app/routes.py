from app import app

from flask import render_template, request


@app.route('/')
def route():
    return render_template('index.html')