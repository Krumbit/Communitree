/**
 * Pure mapping functions from backend snake_case API responses to frontend types.
 * All types are imported from communitree-context to ensure a single source of truth.
 */
import type { PersonalTask, Member, Unlockable, UnlockableCategory, WeeklyStat } from "@/context/communitree-context";
import { UNLOCKABLES_META } from "@/constants/unlockables-meta";

// ---------------------------------------------------------------------------
// Backend raw shapes (mirroring API_Spec.md)
// ---------------------------------------------------------------------------

export type RawUser = {
  id: number;
  username: string;
  email: string;
  balance: number;
  admin: boolean;
  community_id: number | null;
  streak_days: number;
};

export type RawUserTask = {
  id: number;
  description: string;
  user_id: number;
  deadline: string | null;
  completed: boolean;
  created_date: string;
  completed_date: string | null;
};

export type RawMember = {
  id: number;
  username: string;
  role: "owner" | "member";
  completedToday: boolean;
};

export type RawCommunity = {
  id: number;
  name: string;
  code: string;
  tier: number;
  tier_progress: number;
  members: RawMember[];
};

export type RawCommunityTask = {
  id: number;
  description: string;
  community_id: number;
  created_date: string;
};

export type RawUnlockable = {
  id: number;
  price: number;
  category: string;
  minimum_tier: number;
};

export type RawCommunityUnlockable = {
  community_id: number;
  unlockable_id: number;
  applied: boolean;
  unlockable: RawUnlockable;
};

export type RawApiResponse = {
  success: boolean;
  message?: string;
  user: RawUser;
  user_tasks: RawUserTask[];
  community?: RawCommunity;
  community_tasks?: RawCommunityTask[];
  current_task?: RawCommunityTask | null;
  unlocked?: RawCommunityUnlockable[];
  locked?: RawUnlockable[];
};

// ---------------------------------------------------------------------------
// Mapped frontend shapes
// ---------------------------------------------------------------------------

export type MappedUser = {
  id: string;
  name: string;
  firstName: string;
  email: string;
  coins: number;
  streakDays: number;
  signedIn: boolean;
};

export type MappedCommunity = {
  name: string;
  code: string;
  currentTaskTitle: string;
  currentTaskEnds: string;
  dailyThreshold: number;
  plantLevel: number;
  levelProgress: number;
  members: Member[];
  weeklyHistory: WeeklyStat[];
};

// ---------------------------------------------------------------------------
// Individual mappers
// ---------------------------------------------------------------------------

function initials(username: string): string {
  return username
    .split(/\s+/)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function mapUser(raw: RawUser): MappedUser {
  const name = raw.username;
  return {
    id: String(raw.id),
    name,
    firstName: name.split(" ")[0],
    email: raw.email,
    coins: raw.balance,
    streakDays: raw.streak_days,
    signedIn: true,
  };
}

export function mapPersonalTask(raw: RawUserTask): PersonalTask {
  return {
    id: String(raw.id),
    title: raw.description,
    deadline: raw.deadline ?? "",
    completed: raw.completed,
  };
}

export function mapMember(raw: RawMember): Member {
  return {
    id: String(raw.id),
    name: raw.username,
    initials: initials(raw.username),
    completedToday: raw.completedToday,
    role: raw.role,
  };
}

export function mapCommunity(
  raw: RawCommunity,
  currentTask: RawCommunityTask | null | undefined
): MappedCommunity {
  return {
    name: raw.name,
    code: raw.code,
    currentTaskTitle: currentTask?.description ?? "",
    currentTaskEnds: "Resets each night at 11:59 PM",
    dailyThreshold: 0.5,
    plantLevel: raw.tier,
    levelProgress: raw.tier_progress * 100,
    members: raw.members.map(mapMember),
    weeklyHistory: [], // no backend equivalent yet — degrades gracefully
  };
}

export function mapUnlockables(
  unlocked: RawCommunityUnlockable[],
  locked: RawUnlockable[]
): Unlockable[] {
  const unlockedItems: Unlockable[] = unlocked.map(({ unlockable, applied: _applied }) => {
    const meta = UNLOCKABLES_META[unlockable.id];
    return {
      id: String(unlockable.id),
      name: meta?.name ?? `Item ${unlockable.id}`,
      category: unlockable.category as UnlockableCategory,
      price: unlockable.price,
      minimumTier: unlockable.minimum_tier,
      description: meta?.description ?? "",
      accent: meta?.accent ?? "#888888",
      purchased: true,
    };
  });

  const lockedItems: Unlockable[] = locked.map((unlockable) => {
    const meta = UNLOCKABLES_META[unlockable.id];
    return {
      id: String(unlockable.id),
      name: meta?.name ?? `Item ${unlockable.id}`,
      category: unlockable.category as UnlockableCategory,
      price: unlockable.price,
      minimumTier: unlockable.minimum_tier,
      description: meta?.description ?? "",
      accent: meta?.accent ?? "#888888",
      purchased: false,
    };
  });

  return [...unlockedItems, ...lockedItems];
}

export function mapEquipped(
  unlocked: RawCommunityUnlockable[]
): Record<UnlockableCategory, string> {
  const equipped: Record<UnlockableCategory, string> = {
    pot: "",
    ribbon: "",
    ornament: "",
  };

  for (const { unlockable, applied } of unlocked) {
    if (applied) {
      equipped[unlockable.category as UnlockableCategory] = String(unlockable.id);
    }
  }

  return equipped;
}
