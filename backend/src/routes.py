from flask import Blueprint, request, Response, jsonify
from src.models import *
from src.constants import *
from sqlalchemy import select, update, delete, and_
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from datetime import datetime, timedelta

routes = Blueprint('main', __name__)
ph = PasswordHasher()


def gen_user_tasks_query(user_id: int):
    return (
        select(UserTask)
        .where(
            UserTask.user_id == user_id and
            UserTask.created_date > datetime.now() - timedelta(days=7) and
            UserTask.completed == False
        )
    )


def gen_community_tasks_query(user_id: int):
    return (
        select(CommunityTask)
        .outerjoin(
            UserCommunityTask,
            and_(
                UserCommunityTask.community_task_id == CommunityTask.id,
                UserCommunityTask.user_id == user_id
            )
        )
        .where(
            and_(
                UserCommunityTask.user_id == None, # not completed task yet
                CommunityTask.created_date > datetime.now() - timedelta(days=7)
            )   
        )
    )


def gen_unlocked_query(community_id: int):
    return (
        select(Unlockable)
        .join(CommunityUnlockable) 
        .where(CommunityUnlockable.community_id == community_id)
    )


def gen_locked_query(community_id: int):
    return (
        select(Unlockable)
        .outerjoin(
            CommunityUnlockable,
            and_(
                CommunityUnlockable.unlockable_id == Unlockable.id,
                CommunityUnlockable.community_id == community_id
            )
        )
        .where(
            CommunityUnlockable.community_id == None
        )
    )


def query_user_data(user_id: int):
    user = db.get_or_404(User, user_id)
    user_tasks = db.session.scalars(gen_user_tasks_query(user.id)).all()

    if user.community_id is None:
        return jsonify({
            'success': True,
            'user': user.to_dict(),
            'user_tasks': [t.to_dict() for t in user_tasks]
        })    

    community = db.get_or_404(Community, user.community_id)
    community_tasks = db.session.scalars(gen_community_tasks_query(user.id)).all()
    unlocked = db.session.scalars(gen_unlocked_query(community.id)).all()
    locked = db.session.scalars(gen_locked_query(community.id)).all()

    return jsonify({
        'success': True,
        'user': user.to_dict(),
        'user_tasks': [t.to_dict() for t in user_tasks],
        'community': community.to_dict(),
        'community_tasks': [t.to_dict() for t in community_tasks],
        'unlocked': [u.to_dict() for u in unlocked],
        'locked': [l.to_dict() for l in locked]
    })   


@routes.route('/data/<int:user_id>', methods=['GET'])
def get_user_data(user_id: int) -> Response:
    return query_user_data(user_id)


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

    return query_user_data(user.id)


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

    user = User(username, email, passhash)
    db.session.add(user)
    db.session.commit()

    return query_user_data(user.id)


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

    query = delete(UserCommunityTask).where(UserCommunityTask.user_id == user_id)
    db.session.execute(query)
    db.session.commit()

    return jsonify({"success": True})


@routes.route('/create-user-task', methods=['POST'])
def create_user_task():
    data = request.get_json()
    user_id = data.get('user_id')
    task_description = data.get('task_description')

    user = db.get_or_404(User, user_id) # check user with user_id exists
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
    task.completed_date = func.now()
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

    # update tier + tier progress + streak

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
    new_unlock = CommunityUnlockable(user.community_id, unlockable_id)
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

    unlockable = db.get_or_404(Unlockable, unlockable_id)
    community_unlockable = db.first_or_404(query)

    unlockables_in_category = (
        select(Unlockable.id)
        .where(
            Unlockable.category == unlockable.category
        )
    )

    db.session.execute(
        update(CommunityUnlockable)
        .where(
            and_(
                CommunityUnlockable.community_id == user.community_id,
                CommunityUnlockable.unlockable_id.in_(unlockables_in_category)
            )
        )
        .values(applied=False)
    )

    community_unlockable.applied = True
    db.session.commit()

    return jsonify({"success": True})