# Backend API Spec

If the `success` is `false` assume that a `message` is present in the json. The other fields will not be present.
Any endpoint can return a 404 if the data is invalid.

### `/home/<user_id>`

Method: GET
Purpose: used to get the home page data.
```
Returns: json {
    'success': Bool,
    'user': Dict
}
```

### `/community/<user_id>`

Method: GET
Purpose: used to get the community page data.
```
Returns: json {
    'success': Bool,
    'user': Dict,
    'community': Dict
}
```
### `/shop/<user_id>`

Method: GET
Purpose: used to get the shop page data.
```
Returns: json {
    'success': Bool,
    'user': Dict,
    'unlocked_unlockables': Dict,
    'locked_unlockables': Dict
}
```

### `/login`

Method: POST
Purpose: login the user and get the home page data
```
Requires: json {
    'email': String,
    'password': String
}
```
```
Returns: json {
    'success': Bool,
    'user': Dict
}
```

### `/signup`

Method: POST
Purpose: create a new user and get the home page data
```
Requires: json {
    'email': String,
    'password': String,
    'username': String
}
```
```
Returns: json {
    'success': Bool,
    'user': Dict
}
```

### `create-community`

Method: POST
Purpose: create a community and make the creator the sole admin
```
Requires: json {
    'user_id': Int,
    'community_name': String
}
```
```
Returns: json {
    'success': Bool
}
```

### `join-community`

Method: POST
Purpose: join a community
```
Requires: json {
    'user_id': Int,
    'community_id': Int
}
```
```
Returns: json {
    'success': Bool
}
```

### `leave-community`

Method: POST
Purpose: leave a community
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

### `/create-user-task`

Method: POST
Purpose: create a task for a single user
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

### `/complete-user-task`

Method: POST
Purpose: complete a task for a single user
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

### `/create-community-task`

Method: POST
Purpose: create a task for a community
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

### `/complete-community-task`

Method: POST
Purpose: complete a task for a community
```
Requires: json {
    'user_id': Int,
    'community_task_id': String
}
```
```
Returns: json {
    'success': Bool
}
```

### `/create-user-task`

Method: POST
Purpose: create a task for a single user
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

### `/buy-community-unlockable`

Method: POST
Purpose: buy a community an unlockable
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

### `/apply-community-unlockable`

Method: POST
Purpose: apply an unlockable to the community (changes for all users)
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