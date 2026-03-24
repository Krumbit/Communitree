# Communitree – Project Context

## Overview
React Native (Expo) frontend connected to a Flask + SQLite backend via HTTP. The frontend uses `communitree-context.tsx` to make real API calls, persist sessions via `expo-secure-store`, and keep all screens in sync via a `refreshUserData` pattern.

## Stack
- **Frontend**: Expo (React Native), TypeScript, NativeWind (TailwindCSS)
- **Backend**: Flask, SQLAlchemy, SQLite (in `/backend`) — runs on port 5000
- **Session persistence**: `expo-secure-store` (stores `user_id`)
- **Styling tokens**: `constants/palette.ts` + `tailwind.config.js`

## File Structure
```
app/
  (tabs)/
    index.tsx          – Home / personal tasks + habit history; date picker for new tasks
    community.tsx      – Community view (plant, task, members, manage panel)
    shop.tsx           – Shop (buy/equip cosmetics)
  _layout.tsx
  community-stats.tsx  – Community + personal stats; reverse-chronological weekly history
  profile.tsx          – Profile management: user info, community slot, sign out
  sign-in.tsx          – Sign in / create account (no back arrow; only reached when signed out)

backend/
  app.py               – Flask entry point
  src/
    models.py          – SQLAlchemy models (User, Community, CommunityTask, Unlockable, etc.)
    routes.py          – All API endpoints
    constants.py       – Coin reward values

components/
  PlantPreview.tsx     – Shared plant visual used in community + shop pages

constants/
  api.ts               – API_BASE URL (swap to LAN IP for physical device)
  palette.ts           – Design system colour tokens
  plant-tiers.ts       – PLANT_TIERS array (tier → name + health label); used for progress bar labels
  unlockables-meta.ts  – Static name/description/accent keyed by seeded DB ID (1–6)

context/
  communitree-context.tsx  – All app state; real API calls + SecureStore session

utils/
  mappers.ts           – Backend snake_case → frontend camelCase type mappers
```

## Backend API Routes (Flask)
| Method | Route | Description |
|--------|-------|-------------|
| GET  | `/data/<user_id>` | Full user + community data; triggers lazy daily reset |
| POST | `/login` | Authenticate user |
| POST | `/signup` | Create account |
| POST | `/create-community` | Create community; returns invite `code` |
| POST | `/join-community` | Join community by code (`GROW-{id}`) |
| POST | `/leave-community` | Leave community; transfers ownership randomly if admin |
| POST | `/create-user-task` | Add personal task (accepts optional `deadline` ISO string) |
| POST | `/complete-user-task` | Mark personal task complete |
| POST | `/uncomplete-user-task` | Undo personal task completion |
| POST | `/create-community-task` | Set community task (owner only) |
| POST | `/complete-community-task` | Check in on community task (+1 coin) |
| POST | `/undo-community-checkin` | Undo community check-in (reverses coin) |
| POST | `/buy-community-unlockable` | Buy cosmetic with coins |
| POST | `/apply-community-unlockable` | Equip cosmetic |

## Backend Model Fields (for ERD update)

### User
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| username | String | unique |
| email | String | unique |
| passhash | String | |
| balance | Int | default 0 |
| admin | Bool | default False |
| community_id | Int FK → Community | nullable |
| streak_days | Int | default 0; **new** |
| streak_last_updated | DateTime | nullable; **new** |

### UserTask
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| description | String | |
| user_id | Int FK → User | CASCADE |
| deadline | DateTime | nullable; **new** |
| completed | Bool | default False |
| created_date | DateTime | server default now |
| completed_date | DateTime | nullable |

### Community
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| name | String | |
| tier | Int | default 0 |
| tier_progress | Float | default 0.0; range 0.0–1.0 |
| last_reset_date | DateTime | nullable; **new** — used for lazy daily reset |

> `code` is derived as `GROW-{id}` — not stored as a column.

### CommunityTask, UserCommunityTask, CommunityUnlockable, Unlockable
No changes to these models.

## Integration Notes
- **API base**: `constants/api.ts` — set to `http://localhost:5000` by default. Change to your Mac's LAN IP when testing on a physical device or Android emulator.
- **Session flow**: On app mount, `CommunitreeProvider` reads `user_id` from SecureStore and calls `GET /data/{user_id}`. On login/signup the response is mapped and `user_id` is stored. On sign-out, SecureStore entry is deleted and all state is reset.
- **Refresh pattern**: Every action (complete task, join community, buy item, etc.) calls its endpoint then triggers `refreshUserData()`, keeping all screens in sync with a single truth from the backend.
- **Unlockables seeding**: `backend/app.py` seeds 6 Unlockable rows (IDs 1–6) on startup if the table is empty. The frontend's `constants/unlockables-meta.ts` maps those IDs to display metadata.
- **`unlocked` response shape**: `GET /data` returns `unlocked` as a list of `CommunityUnlockable` dicts (includes `applied` status + embedded `unlockable`), not raw Unlockable dicts.
- **user_tasks includes completed**: The `/data` endpoint now returns all tasks from the last 7 days (completed and incomplete), so the dashboard habit history can display them.
- **Loading guard**: `index.tsx` shows a spinner while `isLoading` is true (SecureStore lookup + initial data fetch) to prevent a flash redirect to sign-in on startup.
- **weeklyHistory**: Mapper returns `[]` — no backend equivalent yet. Stats page degrades gracefully.

## Key Design Decisions
- **Plant tiers**: Community progress tracked as `tier` (int 0–7, indexes into `PLANT_TIERS`) + `tier_progress` (float 0.0–1.0). Frontend mock uses `plantLevel` as the tier index. Tier cannot decrease; `tier_progress` floors at 0.0 on a bad day.
- **Daily reset**: Lazy — runs inside `query_user_data` when `community.last_reset_date` is not today. Updates `tier`/`tier_progress`, awards streak bonuses (+3 at every 7-day milestone) and collective bonus (+2 if 100% completion), and updates `streak_days` per member.
- **Community invite code**: Derived as `GROW-{community.id}` — not stored. `join-community` parses the ID from the code string.
- **Admin transfer**: When admin calls `leave-community`, ownership is randomly assigned to another member. The leaving user's `admin` flag is cleared.
- **Ownership**: `user.admin` in the backend maps to `member.role === "owner"` in the frontend context. Only owners can create community tasks.
- **No community state**: When `inCommunity` is false, the community page shows a simplified join/create UI. Real backend equivalent: `user.community_id === null`.
- **Cosmetics are community-wide**: Unlockables belong to the community (not the individual user). Purchasing uses the community's shared coin pool in the backend, though the mock uses the individual user's balance.
- **Plant preview**: Both community and shop pages use `components/PlantPreview.tsx` to keep the visual in sync.
- **Profile page**: `app/profile.tsx` is the profile management screen (accessed from dashboard user icon). Sign-out sets `user.signedIn = false` and redirects to sign-in.
- **Task history**: Completed personal tasks are shown inline in `index.tsx` with a strikethrough style + filled checkmark. They do not disappear on completion.
- **Date picker**: `@react-native-community/datetimepicker` is used for deadline selection in the task composer (separate date and time pickers).

## Running Locally
1. **Backend**: `cd backend && python3 app.py` — starts on port 5000, seeds unlockables on first run.
2. **Frontend**: `npx expo start --go` (Expo Go) or `npx expo run:ios` (dev build) — connects to `http://localhost:5000`.
