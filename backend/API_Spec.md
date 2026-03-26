# Backend API Spec

If `success` is `false`, a `message` field will be present. Other fields will not be present.
Any endpoint can return a 404 if the referenced resource does not exist.

---

### `/data/<user_id>`

Method: GET
Purpose: Fetch all data required for the app (home, community, shop). Also triggers the lazy daily reset for the user's community.
Note: `user_tasks` includes both completed and incomplete tasks from the last 7 days.
```
Returns: json {
    'success': Bool,
    'user': Dict,
    'user_tasks': List[Dict],
    // Only present if user is in a community:
    'community': Dict,           // includes 'members' list with 'completedToday' per member
    'community_tasks': List[Dict],
    'current_task': Dict | null, // most recent community task (present even if user already completed it)
    'unlocked': List[CommunityUnlockable dict],  // purchased items; each includes applied status
    'locked': List[Unlockable dict]              // unpurchased items
}
```

---

### `/login`

Method: POST
Purpose: Authenticate the user and return all app data.
```
Requires: json {
    'email': String,
    'password': String
}
```
```
Returns: json {
    'success': Bool,
    'user': Dict,
    'user_tasks': List[Dict],
    'community': Dict,
    'community_tasks': List[Dict],
    'current_task': Dict | null,
    'unlocked': List[CommunityUnlockable dict],
    'locked': List[Unlockable dict]
}
```

---

### `/signup`

Method: POST
Purpose: Create a new user account and return all app data.
```
Requires: json {
    'username': String,
    'email': String,
    'password': String
}
```
```
Returns: json {
    'success': Bool,
    'user': Dict,
    'user_tasks': List[Dict],
    'community': Dict,
    'community_tasks': List[Dict],
    'current_task': Dict | null,
    'unlocked': List[CommunityUnlockable dict],
    'locked': List[Unlockable dict]
}
```

---

### `/create-community`

Method: POST
Purpose: Create a community and make the creator the sole admin.
```
Requires: json {
    'user_id': Int,
    'community_name': String
}
```
```
Returns: json {
    'success': Bool,
    'code': String    // e.g. "GROW-42" — share with others to join
}
```

---

### `/join-community`

Method: POST
Purpose: Join a community using its invite code.
```
Requires: json {
    'user_id': Int,
    'code': String    // format: "GROW-{id}", e.g. "GROW-42"
}
```
```
Returns: json {
    'success': Bool
}
```

---

### `/leave-community`

Method: POST
Purpose: Leave the current community. If the leaving user is admin, ownership is randomly transferred to another member.
```
Requires: json {
    'user_id': Int
}
```
```
Returns: json {
    'success': Bool
}
```

---

### `/emulate-day-passing`

Method: POST
Purpose: Demo-only control that advances the user's community by one simulated day, immediately applying the daily reset logic and clearing current task check-ins for the next day. Admin only.
```
Requires: json {
    'user_id': Int
}
```
```
Returns: json {
    'success': Bool,
    'message': String
}
```

---

### `/create-user-task`

Method: POST
Purpose: Create a personal task for a single user.
```
Requires: json {
    'user_id': Int,
    'task_description': String,
    'deadline': String | null    // ISO 8601 datetime, e.g. "2026-03-20T18:00:00"
}
```
```
Returns: json {
    'success': Bool
}
```

---

### `/complete-user-task`

Method: POST
Purpose: Mark a personal task as complete.
```
Requires: json {
    'user_id': Int,
    'task_id': Int
}
```
```
Returns: json {
    'success': Bool
}
```

---

### `/uncomplete-user-task`

Method: POST
Purpose: Undo completion of a personal task.
```
Requires: json {
    'user_id': Int,
    'task_id': Int
}
```
```
Returns: json {
    'success': Bool
}
```

---

### `/create-community-task`

Method: POST
Purpose: Set the community's shared task. Admin only.
```
Requires: json {
    'user_id': Int,
    'task_description': String
}
```
```
Returns: json {
    'success': Bool
}
```

---

### `/complete-community-task`

Method: POST
Purpose: Check in on the current community task. Awards +1 coin to the user. Returns an error if already checked in.
```
Requires: json {
    'user_id': Int,
    'community_task_id': Int
}
```
```
Returns: json {
    'success': Bool
}
```

---

### `/undo-community-checkin`

Method: POST
Purpose: Undo a community task check-in. Reverses the +1 coin award (balance floored at 0).
```
Requires: json {
    'user_id': Int,
    'community_task_id': Int
}
```
```
Returns: json {
    'success': Bool
}
```

---

### `/buy-community-unlockable`

Method: POST
Purpose: Purchase a cosmetic unlockable for the community using the user's coin balance.
```
Requires: json {
    'user_id': Int,
    'unlockable_id': Int
}
```
```
Returns: json {
    'success': Bool
}
```

---

### `/apply-community-unlockable`

Method: POST
Purpose: Equip a purchased unlockable on the community plant. Unequips any other item in the same category.
```
Requires: json {
    'user_id': Int,
    'unlockable_id': Int
}
```
```
Returns: json {
    'success': Bool
}
```

---

## Data shapes

### User dict
```
{
    'id': Int,
    'username': String,
    'email': String,
    'balance': Int,
    'admin': Bool,
    'community_id': Int | null,
    'streak_days': Int
}
```

### UserTask dict
```
{
    'id': Int,
    'description': String,
    'user_id': Int,
    'deadline': String | null,    // ISO datetime
    'completed': Bool,
    'created_date': String,
    'completed_date': String | null
}
```

### Community dict
```
{
    'id': Int,
    'name': String,
    'code': String,               // "GROW-{id}"
    'tier': Int,                  // 0–7, indexes into PLANT_TIERS
    'tier_progress': Float,       // 0.0–1.0
    'members': [
        {
            'id': Int,
            'username': String,
            'role': 'owner' | 'member',
            'completedToday': Bool    // injected by query_user_data
        }
    ]
}
```

### CommunityTask dict
```
{
    'id': Int,
    'description': String,
    'community_id': Int,
    'created_date': String
}
```

### Unlockable dict
```
{
    'id': Int,
    'price': Int,
    'category': String,
    'minimum_tier': Int
}
```

### CommunityUnlockable dict
```
{
    'community_id': Int,
    'unlockable_id': Int,
    'applied': Bool,
    'unlockable': Unlockable dict
}
```

---

## Coin reward summary

| Event | Amount | Type |
|-------|--------|------|
| Complete daily community task | +1 | Individual, on check-in |
| 7-day streak milestone | +3 | Individual, on daily reset |
| Entire community completes on a day | +2 | Collective, on daily reset |

## Daily reset

Triggered lazily inside `/data/<user_id>` when `community.last_reset_date` is not today. Calculates the previous day's completion rate, updates `tier` / `tier_progress`, awards streak and collective bonuses, and updates each member's `streak_days`.
