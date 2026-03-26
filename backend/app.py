from flask import Flask
from flask_cors import CORS
from src.routes import routes
from src.models import db
from argon2 import PasswordHasher

ph = PasswordHasher()

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


# generatedwith copilot
def create_demo_data(app):
    with app.app_context():
        from src.models import User, UserTask, Community, CommunityTask
        # Check if demo data already exists
        if db.session.query(User).count() > 0:
            return  # Demo data already created
        
        # Create a community
        community = Community(name="Demo Community")
        db.session.add(community)
        db.session.flush()  # To get the community.id
        
        # Create users with starting balance of 50
        users = [
            User(username="alice", email="alice@example.com", passhash=ph.hash("hashed_password")),
            User(username="bob", email="bob@example.com", passhash=ph.hash("hashed_password")),
            User(username="charlie", email="charlie@example.com", passhash=ph.hash("hashed_password")),
        ]
        for user in users:
            user.balance = 50
            user.community_id = community.id
        db.session.add_all(users)
        db.session.flush()  # To get user ids
        
        # Add individual tasks for users
        user_tasks = [
            UserTask(description="Water the plants", user_id=users[0].id),
            UserTask(description="Prune the leaves", user_id=users[0].id),
            UserTask(description="Fertilize the soil", user_id=users[1].id),
            UserTask(description="Check for pests", user_id=users[1].id),
            UserTask(description="Repot the plant", user_id=users[2].id),
            UserTask(description="Monitor growth", user_id=users[2].id),
        ]
        db.session.add_all(user_tasks)
        
        # Add community tasks
        community_tasks = [
            CommunityTask(description="Organize community garden cleanup", community_id=community.id),
            CommunityTask(description="Plan next planting season", community_id=community.id),
            CommunityTask(description="Share gardening tips in forum", community_id=community.id),
        ]
        db.session.add_all(community_tasks)
        
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
    create_demo_data(app)
    app.run(host="0.0.0.0", port=8000, debug=True)