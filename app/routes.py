from app import app

from flask import render_template


@app.route('/')
def route():
    return render_template('index.html')