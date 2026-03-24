from flask import Flask
from flask_cors import CORS
from src.routes import routes
from src.models import db


def seed_unlockables(app):
    """Seed deterministic unlockable IDs on first startup. IDs must match constants/unlockables-meta.ts."""
    with app.app_context():
        from src.models import Unlockable
        if db.session.query(Unlockable).count() == 0:
            items = [
                Unlockable(price=4, category="pot",      minimum_tier=0),  # id=1 Clay Pot
                Unlockable(price=7, category="pot",      minimum_tier=2),  # id=2 Speckled Planter
                Unlockable(price=3, category="ribbon",   minimum_tier=0),  # id=3 Moss Ribbon
                Unlockable(price=5, category="ribbon",   minimum_tier=3),  # id=4 Sunrise Wrap
                Unlockable(price=6, category="ornament", minimum_tier=4),  # id=5 Ladybird Charm
                Unlockable(price=4, category="ornament", minimum_tier=0),  # id=6 Gold Star Tag
            ]
            db.session.add_all(items)
            db.session.commit()


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

    seed_unlockables(app)
    app.run(host="0.0.0.0", port=8000, debug=True)