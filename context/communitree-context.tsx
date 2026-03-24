import * as SecureStore from "expo-secure-store";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { API_BASE } from "@/constants/api";
import {
  mapCommunity,
  mapEquipped,
  mapPersonalTask,
  mapUnlockables,
  mapUser,
  type MappedCommunity,
  type MappedUser,
  type RawApiResponse,
} from "@/utils/mappers";

// ---------------------------------------------------------------------------
// Public types (used by screens)
// ---------------------------------------------------------------------------

export type PersonalTask = {
  id: string;
  title: string;
  deadline: string;
  completed: boolean;
};

export type Member = {
  id: string;
  name: string;
  initials: string;
  completedToday: boolean;
  role?: "owner" | "member";
};

export type WeeklyStat = {
  week: string;
  completionRate: number;
  perfectDays: number;
  coinsEarned: number;
  plantDelta: number;
};

export type UnlockableCategory = "pot" | "ribbon" | "ornament";

export type Unlockable = {
  id: string;
  name: string;
  category: UnlockableCategory;
  price: number;
  description: string;
  accent: string;
  purchased: boolean;
};

type User = MappedUser;
type Community = MappedCommunity;

export type ActionResult = { ok: boolean; message: string };

type CommunitreeContextValue = {
  user: User;
  community: Community;
  personalTasks: PersonalTask[];
  unlockables: Unlockable[];
  equipped: Record<UnlockableCategory, string>;
  completionRate: number;
  completedCount: number;
  inCommunity: boolean;
  isOwner: boolean;
  isLoading: boolean;
  togglePersonalTask: (taskId: string) => Promise<void>;
  addPersonalTask: (title: string, deadline: string) => Promise<void>;
  toggleCommunityCompletion: () => Promise<void>;
  createCommunityTask: (title: string) => Promise<void>;
  joinCommunity: (code: string) => Promise<ActionResult>;
  leaveCommunity: () => Promise<void>;
  createCommunity: (name: string) => Promise<ActionResult>;
  buyUnlockable: (unlockableId: string) => Promise<ActionResult>;
  equipUnlockable: (unlockableId: string) => Promise<void>;
  signIn: (email: string, password: string, username?: string) => Promise<ActionResult>;
  signOut: () => Promise<void>;
};

// ---------------------------------------------------------------------------
// Blank defaults (used before data loads)
// ---------------------------------------------------------------------------

const blankUser: User = {
  id: "",
  name: "",
  firstName: "",
  email: "",
  coins: 0,
  streakDays: 0,
  signedIn: false,
};

const blankCommunity: Community = {
  name: "",
  code: "",
  currentTaskTitle: "",
  currentTaskEnds: "Resets each night at 11:59 PM",
  dailyThreshold: 0.5,
  plantLevel: 0,
  levelProgress: 0,
  members: [],
  weeklyHistory: [],
};

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

const networkError = (path: string): RawApiResponse =>
  ({ success: false, message: `Could not reach server (${path}). Check your network or API_BASE.` } as RawApiResponse);

async function apiGet(path: string): Promise<RawApiResponse> {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    return await res.json();
  } catch {
    return networkError(path);
  }
}

async function apiPost(path: string, body: Record<string, unknown>): Promise<RawApiResponse> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch {
    return networkError(path);
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const CommunitreeContext = createContext<CommunitreeContextValue | null>(null);

export function CommunitreeProvider({ children }: PropsWithChildren) {
  const [userId, setUserId] = useState<number | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState<User>(blankUser);
  const [community, setCommunity] = useState<Community>(blankCommunity);
  const [personalTasks, setPersonalTasks] = useState<PersonalTask[]>([]);
  const [unlockables, setUnlockables] = useState<Unlockable[]>([]);
  const [equipped, setEquipped] = useState<Record<UnlockableCategory, string>>({
    pot: "",
    ribbon: "",
    ornament: "",
  });
  const [inCommunity, setInCommunity] = useState(false);

  // Keep a stable ref to userId for use inside callbacks without stale closures
  const userIdRef = useRef<number | null>(null);
  userIdRef.current = userId;

  // ---------------------------------------------------------------------------
  // State hydration from API response
  // ---------------------------------------------------------------------------

  const hydrateFromResponse = useCallback((data: RawApiResponse) => {
    const mappedUser = mapUser(data.user);
    setUser(mappedUser);
    setPersonalTasks(data.user_tasks.map(mapPersonalTask));

    if (data.community) {
      setCommunity(mapCommunity(data.community, data.current_task));
      setUnlockables(mapUnlockables(data.unlocked ?? [], data.locked ?? []));
      setEquipped(mapEquipped(data.unlocked ?? []));
      setCurrentTaskId(data.current_task?.id ?? null);
      setInCommunity(true);
    } else {
      setCommunity(blankCommunity);
      setUnlockables([]);
      setEquipped({ pot: "", ribbon: "", ornament: "" });
      setCurrentTaskId(null);
      setInCommunity(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Refresh: fetch latest data for the current user
  // ---------------------------------------------------------------------------

  const refreshUserData = useCallback(
    async (uid?: number) => {
      const id = uid ?? userIdRef.current;
      if (!id) return;
      const data = await apiGet(`/data/${id}`);
      if (data.success) hydrateFromResponse(data);
    },
    [hydrateFromResponse]
  );

  // ---------------------------------------------------------------------------
  // On mount: restore session from SecureStore
  // ---------------------------------------------------------------------------

  useEffect(() => {
    SecureStore.getItemAsync("user_id").then(async (stored) => {
      if (stored) {
        const id = Number(stored);
        setUserId(id);
        userIdRef.current = id;
        await refreshUserData(id);
      }
      setIsLoading(false);
    });
  }, [refreshUserData]);

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const completedCount = community.members.filter((m) => m.completedToday).length;
  const completionRate =
    community.members.length === 0 ? 0 : completedCount / community.members.length;
  const isOwner = community.members.some(
    (m) => m.id === user.id && m.role === "owner"
  );

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const value = useMemo<CommunitreeContextValue>(() => {
    const uid = () => userIdRef.current!;

    const signIn = async (
      email: string,
      password: string,
      username?: string
    ): Promise<ActionResult> => {
      const endpoint = username ? "/signup" : "/login";
      const body = username
        ? { username, email, password }
        : { email, password };

      const data = await apiPost(endpoint, body);
      if (!data.success) return { ok: false, message: data.message ?? "Authentication failed." };

      const id = data.user.id;
      await SecureStore.setItemAsync("user_id", String(id));
      setUserId(id);
      userIdRef.current = id;
      hydrateFromResponse(data);
      return { ok: true, message: "" };
    };

    const signOut = async () => {
      await SecureStore.deleteItemAsync("user_id");
      setUserId(null);
      userIdRef.current = null;
      setUser(blankUser);
      setCommunity(blankCommunity);
      setPersonalTasks([]);
      setUnlockables([]);
      setEquipped({ pot: "", ribbon: "", ornament: "" });
      setInCommunity(false);
      setCurrentTaskId(null);
    };

    const togglePersonalTask = async (taskId: string) => {
      const task = personalTasks.find((t) => t.id === taskId);
      if (!task) return;
      const endpoint = task.completed ? "/uncomplete-user-task" : "/complete-user-task";
      await apiPost(endpoint, { user_id: uid(), task_id: Number(taskId) });
      await refreshUserData();
    };

    const addPersonalTask = async (title: string, deadline: string) => {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) return;
      await apiPost("/create-user-task", {
        user_id: uid(),
        task_description: trimmedTitle,
        deadline: deadline || null,
      });
      await refreshUserData();
    };

    const toggleCommunityCompletion = async () => {
      if (!currentTaskId) return;
      const currentMember = community.members.find((m) => m.id === user.id);
      const hasCompleted = currentMember?.completedToday ?? false;
      const endpoint = hasCompleted ? "/undo-community-checkin" : "/complete-community-task";
      await apiPost(endpoint, { user_id: uid(), community_task_id: currentTaskId });
      await refreshUserData();
    };

    const createCommunityTask = async (title: string) => {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) return;
      await apiPost("/create-community-task", {
        user_id: uid(),
        task_description: trimmedTitle,
      });
      await refreshUserData();
    };

    const joinCommunity = async (code: string): Promise<ActionResult> => {
      const data = await apiPost("/join-community", { user_id: uid(), code: code.trim() });
      if (!data.success) return { ok: false, message: data.message ?? "Could not join community." };
      await refreshUserData();
      return { ok: true, message: "Joined community." };
    };

    const leaveCommunity = async () => {
      await apiPost("/leave-community", { user_id: uid() });
      await refreshUserData();
    };

    const createCommunity = async (name: string): Promise<ActionResult> => {
      const trimmedName = name.trim();
      if (!trimmedName) return { ok: false, message: "Community name cannot be empty." };
      const data = await apiPost("/create-community", {
        user_id: uid(),
        community_name: trimmedName,
      });
      if (!data.success) return { ok: false, message: data.message ?? "Could not create community." };
      await refreshUserData();
      return { ok: true, message: `"${trimmedName}" created. Share your code with friends.` };
    };

    const buyUnlockable = async (unlockableId: string): Promise<ActionResult> => {
      const data = await apiPost("/buy-community-unlockable", {
        user_id: uid(),
        unlockable_id: Number(unlockableId),
      });
      if (!data.success) return { ok: false, message: data.message ?? "Purchase failed." };
      await refreshUserData();
      const target = unlockables.find((u) => u.id === unlockableId);
      return { ok: true, message: `${target?.name ?? "Item"} unlocked for your community plant.` };
    };

    const equipUnlockable = async (unlockableId: string) => {
      await apiPost("/apply-community-unlockable", {
        user_id: uid(),
        unlockable_id: Number(unlockableId),
      });
      await refreshUserData();
    };

    return {
      user,
      community,
      personalTasks,
      unlockables,
      equipped,
      completionRate,
      completedCount,
      inCommunity,
      isOwner,
      isLoading,
      togglePersonalTask,
      addPersonalTask,
      toggleCommunityCompletion,
      createCommunityTask,
      joinCommunity,
      leaveCommunity,
      createCommunity,
      buyUnlockable,
      equipUnlockable,
      signIn,
      signOut,
    };
  }, [
    community,
    completedCount,
    completionRate,
    currentTaskId,
    equipped,
    hydrateFromResponse,
    inCommunity,
    isLoading,
    isOwner,
    personalTasks,
    refreshUserData,
    unlockables,
    user,
  ]);

  return (
    <CommunitreeContext.Provider value={value}>
      {children}
    </CommunitreeContext.Provider>
  );
}

export function useCommunitree() {
  const context = useContext(CommunitreeContext);

  if (!context) {
    throw new Error("useCommunitree must be used within a CommunitreeProvider");
  }

  return context;
}
