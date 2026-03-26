import random
from math import ceil
from datetime import date, datetime, timedelta, timezone

from flask import Blueprint, request, Response, jsonify
from sqlalchemy import select, update, delete, and_
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from src.models import (
    db,
    User,
    UserTask,
    Community,
    CommunityTask,
    UserCommunityTask,
    CommunityUnlockable,
    Unlockable,
)
from src.constants import (
    COINS_FOR_COMPLETE_TASK,
    COINS_STREAK_BONUS,
    COINS_COLLECTIVE_BONUS,
    LEVELS_PER_TIER,
    MAX_TIER,
)

routes = Blueprint("main", __name__)
ph = PasswordHasher()


# ---------------------------------------------------------------------------
# Query helpers
# ---------------------------------------------------------------------------


def gen_user_tasks_query(user_id: int):
    """Return all personal tasks created in the last 7 days (completed or not)."""
    return select(UserTask).where(
        UserTask.user_id == user_id,
        UserTask.created_date > datetime.now() - timedelta(days=7),
    )


def gen_community_tasks_query(user_id: int):
    """Return community tasks from the last 7 days that this user has NOT yet completed."""
    return (
        select(CommunityTask)
        .outerjoin(
            UserCommunityTask,
            and_(
                UserCommunityTask.community_task_id == CommunityTask.id,
                UserCommunityTask.user_id == user_id,
            ),
        )
        .where(
            and_(
                UserCommunityTask.user_id == None,
                CommunityTask.created_date > datetime.now() - timedelta(days=7),
            )
        )
    )


def gen_unlocked_query(community_id: int):
    """Returns CommunityUnlockable rows (includes applied status and embedded unlockable)."""
    return select(CommunityUnlockable).where(
        CommunityUnlockable.community_id == community_id
    )


def gen_locked_query(community_id: int):
    return (
        select(Unlockable)
        .outerjoin(
            CommunityUnlockable,
            and_(
                CommunityUnlockable.unlockable_id == Unlockable.id,
                CommunityUnlockable.community_id == community_id,
            ),
        )
        .where(CommunityUnlockable.community_id == None)
    )


def get_current_task(community_id: int) -> CommunityTask | None:
    """Return the most recent community task created within the last 7 days."""
    return db.session.scalar(
        select(CommunityTask)
        .where(
            CommunityTask.community_id == community_id,
            CommunityTask.created_date > datetime.now() - timedelta(days=7),
        )
        .order_by(CommunityTask.created_date.desc())
        .limit(1)
    )


# ---------------------------------------------------------------------------
# Daily reset (lazy — runs once per day per community)
# ---------------------------------------------------------------------------


def run_daily_reset(
    community: Community,
    reset_date: date,
    *,
    clear_current_task_checkins: bool = False,
):
    current_task = get_current_task(community.id)
    reset_at = datetime.combine(reset_date, datetime.min.time(), tzinfo=timezone.utc)

    if current_task is None:
        community.last_reset_date = reset_at
        db.session.commit()
        return

    total_members = len(community.users)
    if total_members == 0:
        community.last_reset_date = reset_at
        db.session.commit()
        return

    completed_user_ids = {
        row.user_id
        for row in db.session.scalars(
            select(UserCommunityTask).where(
                UserCommunityTask.community_task_id == current_task.id
            )
        ).all()
    }
    completed_count = len(completed_user_ids)

    # --- Plant tier progression ---
    threshold = ceil(total_members * 0.5)
    delta = completed_count - threshold
    community.tier_progress += delta / LEVELS_PER_TIER

    if community.tier_progress < 0.0:
        community.tier_progress = 0.0

    while community.tier_progress >= 1.0 and community.tier < MAX_TIER:
        community.tier_progress -= 1.0
        community.tier += 1

    if community.tier >= MAX_TIER:
        community.tier_progress = min(community.tier_progress, 1.0)

    # --- Collective bonus ---
    collective_bonus = completed_count == total_members

    # --- Per-member streak + bonuses ---
    yesterday = reset_date - timedelta(days=1)

    for member in community.users:
        member_completed = member.id in completed_user_ids

        if member_completed:
            last_updated = member.streak_last_updated
            if last_updated is not None:
                last_date = (
                    last_updated.date()
                    if hasattr(last_updated, "date")
                    else last_updated
                )
                if last_date == yesterday:
                    member.streak_days += 1
                elif last_date != reset_date:
                    member.streak_days = 1
            else:
                member.streak_days = 1

            member.streak_last_updated = reset_at

            if member.streak_days % 7 == 0:
                member.balance += COINS_STREAK_BONUS

            if collective_bonus:
                member.balance += COINS_COLLECTIVE_BONUS
        else:
            member.streak_days = 0

    if clear_current_task_checkins:
        db.session.execute(
            delete(UserCommunityTask).where(
                UserCommunityTask.community_task_id == current_task.id
            )
        )

    community.last_reset_date = reset_at
    db.session.commit()


def maybe_run_daily_reset(community: Community):
    today = datetime.now(timezone.utc).date()

    if community.last_reset_date is not None:
        last = community.last_reset_date
        if hasattr(last, "date"):
            last = last.date()
        if last >= today:
            return

    run_daily_reset(community, today)


# ---------------------------------------------------------------------------
# Data query (shared by /data, /login, /signup)
# ---------------------------------------------------------------------------


def query_user_data(user_id: int):
    user = db.get_or_404(User, user_id)
    user_tasks = db.session.scalars(gen_user_tasks_query(user.id)).all()

    if user.community_id is None:
        return jsonify(
            {
                "success": True,
                "user": user.to_dict(),
                "user_tasks": [t.to_dict() for t in user_tasks],
            }
        )

    community = db.get_or_404(Community, user.community_id)

    maybe_run_daily_reset(community)

    community_tasks = db.session.scalars(gen_community_tasks_query(user.id)).all()
    unlocked = db.session.scalars(gen_unlocked_query(community.id)).all()
    locked = db.session.scalars(gen_locked_query(community.id)).all()

    # Inject completedToday per member
    current_task = get_current_task(community.id)
    completed_today_ids = set()
    if current_task:
        completed_today_ids = {
            row.user_id
            for row in db.session.scalars(
                select(UserCommunityTask).where(
                    UserCommunityTask.community_task_id == current_task.id
                )
            ).all()
        }

    community_data = community.to_dict()
    for member in community_data["members"]:
        member["completedToday"] = member["id"] in completed_today_ids

    return jsonify(
        {
            "success": True,
            "user": user.to_dict(),
            "user_tasks": [t.to_dict() for t in user_tasks],
            "community": community_data,
            "community_tasks": [t.to_dict() for t in community_tasks],
            "current_task": current_task.to_dict() if current_task else None,
            "unlocked": [u.to_dict() for u in unlocked],
            "locked": [l.to_dict() for l in locked],
        }
    )


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------


@routes.route("/data/<int:user_id>", methods=["GET"])
def get_user_data(user_id: int) -> Response:
    return query_user_data(user_id)


@routes.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user_query = select(User).where(User.email == email)
    user = db.session.execute(user_query).scalars().first()

    if user is None:
        return jsonify(
            {"success": False, "message": "No account found with that email."}
        )

    try:
        ph.verify(user.passhash, password)
    except VerifyMismatchError:
        return jsonify({"success": False, "message": "Password entered incorrectly."})

    return query_user_data(user.id)


@routes.route("/signup", methods=["POST"])
def sign_up():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    passhash = ph.hash(password)

    user_query = select(User).where((User.username == username) | (User.email == email))
    user = db.session.execute(user_query).scalars().first()

    if user is not None:
        return jsonify(
            {
                "success": False,
                "message": "A user already exists with this email or username.",
            }
        )

    user = User(username, email, passhash)
    db.session.add(user)
    db.session.commit()

    return query_user_data(user.id)


# ---------------------------------------------------------------------------
# Community management
# ---------------------------------------------------------------------------


@routes.route("/create-community", methods=["POST"])
def create_community():
    data = request.get_json()
    user_id = data.get("user_id")
    community_name = data.get("community_name")

    user = db.get_or_404(User, user_id)
    community = Community(community_name)
    db.session.add(community)
    db.session.flush()
    user.community_id = community.id
    user.admin = True
    db.session.commit()

    return jsonify({"success": True, "code": f"GROW-{community.id}"})


@routes.route("/join-community", methods=["POST"])
def join_community():
    """Accepts a community code in the format GROW-{id}."""
    data = request.get_json()
    user_id = data.get("user_id")
    code = data.get("code")

    try:
        community_id = int(code.split("-")[1])
    except (AttributeError, IndexError, ValueError):
        return jsonify({"success": False, "message": "Invalid community code format."})

    user = db.get_or_404(User, user_id)
    db.get_or_404(
        Community, community_id, description=f"No community found for code {code}."
    )

    user.community_id = community_id
    db.session.commit()

    return jsonify({"success": True})


@routes.route("/leave-community", methods=["POST"])
def leave_community():
    data = request.get_json()
    user_id = data.get("user_id")

    user = db.get_or_404(User, user_id)
    community = db.get_or_404(Community, user.community_id)

    # Transfer ownership to a random remaining member before leaving
    if user.admin:
        others = [u for u in community.users if u.id != user_id]
        if others:
            random.choice(others).admin = True
        user.admin = False

    user.community_id = None

    db.session.execute(
        delete(UserCommunityTask).where(UserCommunityTask.user_id == user_id)
    )
    db.session.commit()

    return jsonify({"success": True})


@routes.route("/emulate-day-passing", methods=["POST"])
def emulate_day_passing():
    data = request.get_json()
    user_id = data.get("user_id")

    user = db.get_or_404(User, user_id)

    if user.community_id is None:
        return jsonify(
            {"success": False, "message": "You are not part of a community."}
        )

    if not user.admin:
        return jsonify(
            {
                "success": False,
                "message": "Only the community owner can use demo controls.",
            }
        )

    community = db.get_or_404(Community, user.community_id)
    simulated_today = datetime.now(timezone.utc).date()

    if community.last_reset_date is not None:
        simulated_today = (
            community.last_reset_date.date()
            if hasattr(community.last_reset_date, "date")
            else community.last_reset_date
        )

    run_daily_reset(
        community,
        simulated_today + timedelta(days=1),
        clear_current_task_checkins=True,
    )

    return jsonify(
        {
            "success": True,
            "message": "Advanced the community by one day for the demo.",
        }
    )


# ---------------------------------------------------------------------------
# Personal tasks
# ---------------------------------------------------------------------------


@routes.route("/create-user-task", methods=["POST"])
def create_user_task():
    data = request.get_json()
    user_id = data.get("user_id")
    task_description = data.get("task_description")
    deadline_str = data.get("deadline")

    db.get_or_404(User, user_id)

    task = UserTask(task_description, user_id)

    if deadline_str:
        try:
            task.deadline = datetime.fromisoformat(deadline_str)
        except ValueError:
            return jsonify(
                {"success": False, "message": "Invalid deadline format. Use ISO 8601."}
            )

    db.session.add(task)
    db.session.commit()

    return jsonify({"success": True})


@routes.route("/complete-user-task", methods=["POST"])
def complete_user_task():
    data = request.get_json()
    user_id = data.get("user_id")
    task_id = data.get("task_id")

    user = db.get_or_404(User, user_id)
    task = db.get_or_404(UserTask, task_id)

    task.completed = True
    task.completed_date = datetime.now()
    db.session.commit()

    return jsonify({"success": True})


@routes.route("/uncomplete-user-task", methods=["POST"])
def uncomplete_user_task():
    data = request.get_json()
    user_id = data.get("user_id")
    task_id = data.get("task_id")

    db.get_or_404(User, user_id)
    task = db.get_or_404(UserTask, task_id)

    task.completed = False
    task.completed_date = None
    db.session.commit()

    return jsonify({"success": True})


# ---------------------------------------------------------------------------
# Community tasks
# ---------------------------------------------------------------------------


@routes.route("/create-community-task", methods=["POST"])
def create_community_task():
    data = request.get_json()
    user_id = data.get("user_id")
    description = data.get("task_description")

    user = db.get_or_404(User, user_id)
    community = db.get_or_404(Community, user.community_id)

    if not user.admin:
        return jsonify(
            {"success": False, "message": "You must be admin to create tasks."}
        )

    task = CommunityTask(description, community.id)
    db.session.add(task)
    db.session.commit()

    return jsonify({"success": True})


@routes.route("/complete-community-task", methods=["POST"])
def complete_community_task():
    data = request.get_json()
    user_id = data.get("user_id")
    community_task_id = data.get("community_task_id")

    user = db.get_or_404(User, user_id)
    db.get_or_404(CommunityTask, community_task_id)

    existing = db.session.scalar(
        select(UserCommunityTask).where(
            UserCommunityTask.user_id == user_id,
            UserCommunityTask.community_task_id == community_task_id,
        )
    )
    if existing:
        return jsonify(
            {"success": False, "message": "Already checked in for this task."}
        )

    db.session.add(UserCommunityTask(user_id, community_task_id))
    user.balance += COINS_FOR_COMPLETE_TASK
    db.session.commit()

    return jsonify({"success": True})


@routes.route("/undo-community-checkin", methods=["POST"])
def undo_community_checkin():
    data = request.get_json()
    user_id = data.get("user_id")
    community_task_id = data.get("community_task_id")

    user = db.get_or_404(User, user_id)

    db.session.execute(
        delete(UserCommunityTask).where(
            UserCommunityTask.user_id == user_id,
            UserCommunityTask.community_task_id == community_task_id,
        )
    )
    user.balance = max(0, user.balance - COINS_FOR_COMPLETE_TASK)
    db.session.commit()

    return jsonify({"success": True})


# ---------------------------------------------------------------------------
# Shop / unlockables
# ---------------------------------------------------------------------------


@routes.route("/buy-community-unlockable", methods=["POST"])
def buy_community_unlockable():
    data = request.get_json()
    user_id = data.get("user_id")
    unlockable_id = data.get("unlockable_id")

    user = db.get_or_404(User, user_id)

    if user.community_id is None:
        return jsonify(
            {"success": False, "message": "You are not part of a community."}
        )

    community = db.get_or_404(Community, user.community_id)

    unlockable = db.get_or_404(Unlockable, unlockable_id)

    if community.tier < unlockable.minimum_tier:
        return jsonify(
            {
                "success": False,
                "message": f"Your community plant must reach tier {unlockable.minimum_tier} before buying this item.",
            }
        )

    existing = db.session.scalar(
        select(CommunityUnlockable).where(
            CommunityUnlockable.community_id == user.community_id,
            CommunityUnlockable.unlockable_id == unlockable_id,
        )
    )
    if existing is not None:
        return jsonify({"success": False, "message": "Already purchased."})

    if user.balance < unlockable.price:
        return jsonify({"success": False, "message": "Insufficient balance."})

    user.balance -= unlockable.price
    db.session.add(CommunityUnlockable(user.community_id, unlockable_id))
    db.session.commit()

    return jsonify({"success": True})


@routes.route("/apply-community-unlockable", methods=["POST"])
def apply_community_unlockable():
    data = request.get_json()
    user_id = data.get("user_id")
    unlockable_id = data.get("unlockable_id")

    user = db.get_or_404(User, user_id)

    unlockable = db.get_or_404(Unlockable, unlockable_id)
    community_unlockable = db.first_or_404(
        select(CommunityUnlockable).where(
            CommunityUnlockable.community_id == user.community_id,
            CommunityUnlockable.unlockable_id == unlockable_id,
        )
    )

    unlockables_in_category = select(Unlockable.id).where(
        Unlockable.category == unlockable.category
    )

    db.session.execute(
        update(CommunityUnlockable)
        .where(
            and_(
                CommunityUnlockable.community_id == user.community_id,
                CommunityUnlockable.unlockable_id.in_(unlockables_in_category),
            )
        )
        .values(applied=False)
    )

    community_unlockable.applied = True
    db.session.commit()

    return jsonify({"success": True})
