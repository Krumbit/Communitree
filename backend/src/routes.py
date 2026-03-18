from flask import Blueprint, request, Response, jsonify
from src.models import *
from src.constants import *
from sqlalchemy import select, update
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

routes = Blueprint('main', __name__)
ph = PasswordHasher()

@routes.route('/home/<int:user_id>', methods=['GET'])
def get_home_page_data(user_id: int) -> Response:
    user = db.get_or_404(User, user_id)

    return jsonify({
        "success": True,
        "user": user.to_dict()
    })


@routes.route('/community/<int:user_id>', methods=['GET'])
def get_community_page_data(user_id: int) -> Response:
    user = db.get_or_404(User, user_id)
    
    community = None
    if user.community_id is not None:
        community = db.session.get(Community, user.community_id)

    if community is None:
        return jsonify({
            "success": False,
            "message": "Join a community to view the community page."
        })

    return jsonify({
        "success": True,
        "user": user.to_dict(), 
        "community": community.to_dict()
    })


@routes.route('/shop/<int:user_id>', methods=['GET'])
def get_shop_page_data(user_id: int) -> Response:
    user = db.get_or_404(User, user_id)

    if user.community_id is None:
        return jsonify({
            "success": False,
            "message": "Join a community to view the community shop page."
        })

    unlocked_query = select(CommunityUnlockable).where(CommunityUnlockable.community_id == user.community_id)
    unlocked = db.session.scalars(unlocked_query).all()
    
    locked_query = select(Unlockable).where(
        ~Unlockable.community_unlockables.any(
            CommunityUnlockable.community_id == user.community_id
        )
    )
    locked = db.session.scalars(locked_query).all()

    return jsonify({
        "success": True,
        "user": user.to_dict(), 
        "unlocked_unlockables": [u.to_dict() for u in unlocked], 
        "locked_unlockables": [l.to_dict() for l in locked]
    })


@routes.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user_query = select(User).where(User.email == email)
    user = db.first_or_404(user_query, description=f"User with email {email} not found.")

    try:
        ph.verify(user.passhash, password)
    except VerifyMismatchError:
        return jsonify({
            "success": False,
            "message": "Password entered incorrectly."
        })

    return jsonify({
        "success": True,
        "user": user.to_dict()
    })


@routes.route('/signup', methods=['POST'])
def sign_up():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    passhash = ph.hash(password)

    user_query = select(User).where((User.username == username) | (User.email == email))
    user = db.session.execute(user_query).scalars().first()
    
    if user is not None:
        return jsonify({
            "success": False,
            "message": "A user already exists with this email or username."
        })

    user = User(username=username, email=email, passhash=passhash)
    db.session.add(user)
    db.session.commit()

    return jsonify({
        "success": True,
        "user": user.to_dict()
    })


@routes.route('/create-community', methods=['POST'])
def create_community():
    data = request.get_json()
    user_id = data.get('user_id')
    community_name = data.get('community_name')

    user = db.get_or_404(User, user_id)
    community = Community(community_name)
    db.session.add(community)
    db.session.flush()
    user.community_id = community.id
    user.admin = True
    db.session.commit()

    return jsonify({"success": True})


@routes.route('/join-community', methods=['POST'])
def join_community():
    data = request.get_json()
    user_id = data.get('user_id')
    community_id = data.get('community_id')

    user = db.get_or_404(User, user_id)
    db.get_or_404(Community, community_id, description=f'A community with id {community_id} does not exist.')
    
    user.community_id = community_id
    db.session.commit()
    
    return jsonify({"success": True})


@routes.route('/leave-community', methods=['POST'])
def leave_community():
    data = request.get_json()
    user_id = data.get('user_id')

    user = db.get_or_404(User, user_id)
    user.community_id = None
    db.session.commit()

    return jsonify({"success": True})


@routes.route('/create-user-task', methods=['POST'])
def create_user_task():
    data = request.get_json()
    user_id = data.get('user_id')
    task_description = data.get('task_description')

    user = db.get_or_404(User, user_id)
    task = UserTask(task_description, user_id)
    db.session.add(task)
    db.session.commit()

    return jsonify({"success": True})


@routes.route('/complete-user-task', methods=['POST'])
def complete_user_task():
    data = request.get_json()
    user_id = data.get('user_id')
    task_id = data.get('task_id')

    user = db.get_or_404(User, user_id)
    task = db.get_or_404(UserTask, task_id)
    
    task.completed = True
    user.balance += COINS_FOR_COMPLETE_TASK
    db.session.commit()

    return jsonify({"success": True})


@routes.route('/create-community-task', methods=['POST'])
def create_community_task():
    data = request.get_json()
    user_id = data.get('user_id')
    description = data.get('task_description')

    user = db.get_or_404(User, user_id)
    community = db.get_or_404(Community, user.community_id)

    if user.admin is False:
        return jsonify({"success": False, "message": "You must be admin to create tasks."})

    task = CommunityTask(description, community.id)
    db.session.add(task)
    db.session.flush()

    for community_user in community.users:
        user_task = UserCommunityTask(community_user.id, task.id)
        db.session.add(user_task)

    db.session.commit()

    return jsonify({"success": True})


@routes.route('/complete-community-task', methods=['POST'])
def complete_community_task():
    data = request.get_json()
    user_id = data.get('user_id')
    community_task_id = data.get('community_task_id')

    user = db.get_or_404(User, user_id)
    
    task_query = select(UserCommunityTask).where(
        UserCommunityTask.user_id == user_id,
        UserCommunityTask.community_task_id == community_task_id
    )
    task = db.first_or_404(task_query)
    
    task.completed = True
    user.balance += COINS_FOR_COMPLETE_TASK
    db.session.commit()

    return jsonify({"success": True})


@routes.route('/buy-community-unlockable', methods=['POST'])
def buy_community_unlockable():
    data = request.get_json()
    user_id = data.get('user_id')
    unlockable_id = data.get('unlockable_id')

    user = db.get_or_404(User, user_id)

    if user.community_id is None:
        return jsonify({"success": False, "message": "You are not part of a community."})

    unlockable = db.get_or_404(Unlockable, unlockable_id)

    query = select(CommunityUnlockable).where(
        CommunityUnlockable.community_id == user.community_id,
        CommunityUnlockable.unlockable_id == unlockable_id
    )
    existing = db.session.scalar(query)

    if existing is not None:
        return jsonify({"success": False, "message": "Already purchased."})
        
    if user.balance < unlockable.price:
        return jsonify({"success": False, "message": "Insufficient balance."})

    user.balance -= unlockable.price
    new_unlock = CommunityUnlockable(community_id=user.community_id, unlockable_id=unlockable_id)
    db.session.add(new_unlock)
    db.session.commit()

    return jsonify({"success": True})


@routes.route('/apply-community-unlockable', methods=['POST'])
def apply_community_unlockable():
    data = request.get_json()
    user_id = data.get('user_id')
    unlockable_id = data.get('unlockable_id')

    user = db.get_or_404(User, user_id)

    query = select(CommunityUnlockable).where(
        CommunityUnlockable.community_id == user.community_id,
        CommunityUnlockable.unlockable_id == unlockable_id
    )
    community_unlockable = db.first_or_404(query)

    db.session.execute(
        update(CommunityUnlockable)
        .where(CommunityUnlockable.community_id == user.community_id)
        .values(applied=False)
    )

    community_unlockable.applied = True
    db.session.commit()

    return jsonify({"success": True})