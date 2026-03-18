import pytest
from app import create_app
from flask import Flask
from src.models import User, Community, UserTask, CommunityTask, Unlockable, CommunityUnlockable, UserCommunityTask, db

# most unit tests written by copilot

@pytest.fixture
def app():
    db, app = create_app()
    app.config.update({"TESTING": True})
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()


@pytest.fixture
def user():
    yield {
        "username": "tester123",
        "password": "password123",
        "email": "tester@test.com"
    }

@pytest.fixture
def user2():
    yield {
        "username": "tester124",
        "password": "password123",
        "email": "tester2@test.com"
    }

@pytest.fixture
def unlockable():
    unlockable = Unlockable(name="Test Unlockable", description="A test unlockable", price=50)
    db.session.add(unlockable)
    db.session.commit()
    yield unlockable


def assert_response(response):
    assert response.json["success"] is True


def assert_user(user, **kwarg):
    for key, value in kwarg.items():
        assert user[key] == value


def test_valid_signup(app: Flask, user):
    response = app.post('/signup', json=user)
    assert_response(response)
    assert_user(response.json['user'], community_id=None)


def test_valid_login(app: Flask, user):
    app.post('/signup', json=user)
    response = app.post('/login', json=user)
    assert_response(response)


def test_valid_create_community(app: Flask, user):
    response = app.post('/signup', json=user)
    response = app.post('/create-community', json={"user_id": response.json['user']['id'], "community_name": "testcommunity"})
    assert_response(response)
     

def test_valid_join_community(app: Flask, user, user2):
    response = app.post('/signup', json=user)
    assert_response(response)
    community = app.post('/create-community', json={"user_id": response.json['user']['id'], "community_name": "testcommunity"})
    assert_response(community)
    response = app.post('/signup', json=user2)
    assert_response(response)
    response = app.post('/join-community', json={"user_id": response.json['user']['id'], "community_id": 1})
    assert_response(response)


def test_get_home_page_data(app: Flask, user):
    signup_response = app.post('/signup', json=user)
    user_id = signup_response.json['user']['id']
    response = app.get(f'/home/{user_id}')
    assert_response(response)
    assert_user(response.json['user'], id=user_id)


def test_get_home_page_data_invalid_user(app: Flask):
    response = app.get('/home/999')
    assert response.status_code == 404


def test_get_community_page_data_no_community(app: Flask, user):
    signup_response = app.post('/signup', json=user)
    user_id = signup_response.json['user']['id']
    response = app.get(f'/community/{user_id}')
    assert response.json["success"] is False
    assert "Join a community" in response.json["message"]


def test_get_community_page_data_with_community(app: Flask, user):
    signup_response = app.post('/signup', json=user)
    user_id = signup_response.json['user']['id']
    app.post('/create-community', json={"user_id": user_id, "community_name": "testcommunity"})
    response = app.get(f'/community/{user_id}')
    assert_response(response)
    assert "community" in response.json


def test_get_shop_page_data_no_community(app: Flask, user, unlockable):
    signup_response = app.post('/signup', json=user)
    user_id = signup_response.json['user']['id']
    response = app.get(f'/shop/{user_id}')
    assert response.json["success"] is False
    assert "Join a community" in response.json["message"]


def test_get_shop_page_data_with_community(app: Flask, user, unlockable):
    signup_response = app.post('/signup', json=user)
    user_id = signup_response.json['user']['id']
    app.post('/create-community', json={"user_id": user_id, "community_name": "testcommunity"})
    response = app.get(f'/shop/{user_id}')
    assert_response(response)
    assert "unlocked_unlockables" in response.json
    assert "locked_unlockables" in response.json


def test_leave_community(app: Flask, user):
    signup_response = app.post('/signup', json=user)
    user_id = signup_response.json['user']['id']
    app.post('/create-community', json={"user_id": user_id, "community_name": "testcommunity"})
    response = app.post('/leave-community', json={"user_id": user_id})
    assert_response(response)


def test_create_user_task(app: Flask, user):
    signup_response = app.post('/signup', json=user)
    user_id = signup_response.json['user']['id']
    response = app.post('/create-user-task', json={"user_id": user_id, "task_description": "Test task"})
    assert_response(response)


def test_complete_user_task(app: Flask, user):
    signup_response = app.post('/signup', json=user)
    user_id = signup_response.json['user']['id']
    app.post('/create-user-task', json={"user_id": user_id, "task_description": "Test task"})
    # Assume task id is 1
    response = app.post('/complete-user-task', json={"user_id": user_id, "task_id": 1})
    assert_response(response)


def test_create_community_task(app: Flask, user):
    signup_response = app.post('/signup', json=user)
    user_id = signup_response.json['user']['id']
    app.post('/create-community', json={"user_id": user_id, "community_name": "testcommunity"})
    response = app.post('/create-community-task', json={"user_id": user_id, "task_description": "Community task"})
    assert_response(response)


def test_create_community_task_not_admin(app: Flask, user, user2):
    signup_response = app.post('/signup', json=user)
    user_id = signup_response.json['user']['id']
    app.post('/create-community', json={"user_id": user_id, "community_name": "testcommunity"})
    signup_response2 = app.post('/signup', json=user2)
    user2_id = signup_response2.json['user']['id']
    app.post('/join-community', json={"user_id": user2_id, "community_id": 1})
    response = app.post('/create-community-task', json={"user_id": user2_id, "task_description": "Community task"})
    assert response.json["success"] is False
    assert "admin" in response.json["message"]


def test_complete_community_task(app: Flask, user):
    signup_response = app.post('/signup', json=user)
    user_id = signup_response.json['user']['id']
    app.post('/create-community', json={"user_id": user_id, "community_name": "testcommunity"})
    app.post('/create-community-task', json={"user_id": user_id, "task_description": "Community task"})
    response = app.post('/complete-community-task', json={"user_id": user_id, "community_task_id": 1})
    assert_response(response)


def test_buy_community_unlockable(app: Flask, user, unlockable):
    signup_response = app.post('/signup', json=user)
    user_id = signup_response.json['user']['id']
    app.post('/create-community', json={"user_id": user_id, "community_name": "testcommunity"})
    # Give user enough balance

    user_obj = db.get_or_404(User, user_id)
    user_obj.balance = 100
    db.session.commit()

    response = app.post('/buy-community-unlockable', json={"user_id": user_id, "unlockable_id": unlockable.id})
    assert_response(response)


def test_buy_community_unlockable_insufficient_balance(app: Flask, user, unlockable):
    signup_response = app.post('/signup', json=user)
    user_id = signup_response.json['user']['id']
    app.post('/create-community', json={"user_id": user_id, "community_name": "testcommunity"})
    response = app.post('/buy-community-unlockable', json={"user_id": user_id, "unlockable_id": unlockable.id})
    assert response.json["success"] is False
    assert "Insufficient balance" in response.json["message"]


def test_buy_community_unlockable_already_purchased(app: Flask, user, unlockable):
    signup_response = app.post('/signup', json=user)
    user_id = signup_response.json['user']['id']
    app.post('/create-community', json={"user_id": user_id, "community_name": "testcommunity"})
    user_obj = db.get_or_404(User, user_id)
    user_obj.balance = 100
    db.session.commit()
    app.post('/buy-community-unlockable', json={"user_id": user_id, "unlockable_id": unlockable.id})
    response = app.post('/buy-community-unlockable', json={"user_id": user_id, "unlockable_id": unlockable.id})
    assert response.json["success"] is False
    assert "Already purchased" in response.json["message"]


def test_apply_community_unlockable(app: Flask, user, unlockable):
    signup_response = app.post('/signup', json=user)
    user_id = signup_response.json['user']['id']
    app.post('/create-community', json={"user_id": user_id, "community_name": "testcommunity"})
    user_obj = db.get_or_404(User, user_id)
    user_obj.balance = 100
    db.session.commit()
    app.post('/buy-community-unlockable', json={"user_id": user_id, "unlockable_id": unlockable.id})
    response = app.post('/apply-community-unlockable', json={"user_id": user_id, "unlockable_id": unlockable.id})
    assert_response(response)


