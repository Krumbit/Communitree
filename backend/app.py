from flask import Flask
from flask_cors import CORS
from src.routes import routes
from src.models import db


def create_app():
    app = Flask(__name__)

    # allows expo (port 8081) to communicate with the app (port 5000)
    CORS(app)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///project.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    app.register_blueprint(routes)

    return db, app

if __name__ == '__main__':
    db, app = create_app()
    with app.app_context():
        # db.drop_all() # disable to save data between tests
        db.create_all()

    app.run(port=5000, debug=True)