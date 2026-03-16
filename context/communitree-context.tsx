import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";

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

type User = {
  id: string;
  name: string;
  firstName: string;
  email: string;
  coins: number;
  streakDays: number;
  signedIn: boolean;
};

type Community = {
  name: string;
  code: string;
  currentTaskTitle: string;
  currentTaskEnds: string;
  dailyThreshold: number;
  plantLevel: number;
  plantName: string;
  levelProgress: number;
  members: Member[];
  weeklyHistory: WeeklyStat[];
};

type SignInPayload = {
  name?: string;
  email: string;
};

type CommunitreeContextValue = {
  user: User;
  community: Community;
  personalTasks: PersonalTask[];
  unlockables: Unlockable[];
  equipped: Record<UnlockableCategory, string>;
  completionRate: number;
  completedCount: number;
  isOwner: boolean;
  togglePersonalTask: (taskId: string) => void;
  addPersonalTask: (title: string, deadline: string) => void;
  toggleCommunityCompletion: () => void;
  createCommunityTask: (title: string) => void;
  joinCommunity: (code: string) => { ok: boolean; message: string };
  buyUnlockable: (unlockableId: string) => { ok: boolean; message: string };
  equipUnlockable: (unlockableId: string) => void;
  signInMock: (payload: SignInPayload) => void;
};

const initialUser: User = {
  id: "user-yan",
  name: "Yan Slobodianik",
  firstName: "Yan",
  email: "yan@example.com",
  coins: 11,
  streakDays: 5,
  signedIn: false,
};

const initialPersonalTasks: PersonalTask[] = [
  {
    id: "task-1",
    title: "Drink water before morning lecture",
    deadline: "2026-03-06T09:00:00.000Z",
    completed: false,
  },
  {
    id: "task-2",
    title: "Plan tomorrow's meals",
    deadline: "2026-03-06T20:00:00.000Z",
    completed: false,
  },
  {
    id: "task-3",
    title: "Stretch for 10 minutes",
    deadline: "2026-03-07T08:30:00.000Z",
    completed: true,
  },
  {
    id: "task-4",
    title: "Review notes after seminar",
    deadline: "2026-03-07T18:00:00.000Z",
    completed: false,
  },
  {
    id: "task-5",
    title: "Set phone downtime before bed",
    deadline: "2026-03-08T21:30:00.000Z",
    completed: false,
  },
];

const initialCommunity: Community = {
  name: "Rosebank House",
  code: "GROW-37",
  currentTaskTitle: "30-minute focused study block",
  currentTaskEnds: "Resets each night at 11:59 PM",
  dailyThreshold: 0.5,
  plantLevel: 7,
  plantName: "Monstera Bloom",
  levelProgress: 72,
  members: [
    {
      id: "user-yan",
      name: "Yan",
      initials: "YS",
      completedToday: false,
      role: "owner",
    },
    { id: "member-jiahe", name: "Jiahe", initials: "JA", completedToday: true },
    { id: "member-ben", name: "Ben", initials: "BD", completedToday: true },
    {
      id: "member-rayhan",
      name: "Rayhan",
      initials: "RM",
      completedToday: false,
    },
  ],
  weeklyHistory: [
    {
      week: "Wk 1",
      completionRate: 0.54,
      perfectDays: 1,
      coinsEarned: 8,
      plantDelta: 1,
    },
    {
      week: "Wk 2",
      completionRate: 0.68,
      perfectDays: 2,
      coinsEarned: 11,
      plantDelta: 2,
    },
    {
      week: "Wk 3",
      completionRate: 0.81,
      perfectDays: 3,
      coinsEarned: 15,
      plantDelta: 3,
    },
    {
      week: "Wk 4",
      completionRate: 0.76,
      perfectDays: 2,
      coinsEarned: 13,
      plantDelta: 2,
    },
  ],
};

const initialUnlockables: Unlockable[] = [
  {
    id: "pot-clay",
    name: "Clay Pot",
    category: "pot",
    price: 4,
    description: "Warm terracotta with a rounded rim.",
    accent: "#C5794A",
    purchased: true,
  },
  {
    id: "pot-speckled",
    name: "Speckled Planter",
    category: "pot",
    price: 7,
    description: "Soft ceramic finish with a pebble glaze.",
    accent: "#E8D7BC",
    purchased: false,
  },
  {
    id: "ribbon-moss",
    name: "Moss Ribbon",
    category: "ribbon",
    price: 3,
    description: "A leafy band for milestone weeks.",
    accent: "#4D8F63",
    purchased: true,
  },
  {
    id: "ribbon-sunrise",
    name: "Sunrise Wrap",
    category: "ribbon",
    price: 5,
    description: "A bright accent for perfect streaks.",
    accent: "#F2A65A",
    purchased: false,
  },
  {
    id: "ornament-ladybird",
    name: "Ladybird Charm",
    category: "ornament",
    price: 6,
    description: "A tiny lucky visitor for the leaves.",
    accent: "#D44B3A",
    purchased: false,
  },
  {
    id: "ornament-star",
    name: "Gold Star Tag",
    category: "ornament",
    price: 4,
    description: "Marks an all-community completion day.",
    accent: "#E0B43B",
    purchased: true,
  },
];

const initialEquipped: Record<UnlockableCategory, string> = {
  pot: "pot-clay",
  ribbon: "ribbon-moss",
  ornament: "ornament-star",
};

const CommunitreeContext = createContext<CommunitreeContextValue | null>(null);

export function CommunitreeProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState(initialUser);
  const [community, setCommunity] = useState(initialCommunity);
  const [personalTasks, setPersonalTasks] = useState(initialPersonalTasks);
  const [unlockables, setUnlockables] = useState(initialUnlockables);
  const [equipped, setEquipped] = useState(initialEquipped);

  const completedCount = community.members.filter(
    (member) => member.completedToday,
  ).length;
  const completionRate =
    community.members.length === 0
      ? 0
      : completedCount / community.members.length;
  const isOwner = community.members.some(
    (member) => member.id === user.id && member.role === "owner",
  );

  const value = useMemo<CommunitreeContextValue>(() => {
    const togglePersonalTask = (taskId: string) => {
      setPersonalTasks((current) =>
        current.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task,
        ),
      );
    };

    const addPersonalTask = (title: string, deadline: string) => {
      const trimmedTitle = title.trim();
      const trimmedDeadline = deadline.trim();

      if (!trimmedTitle || !trimmedDeadline) {
        return;
      }

      setPersonalTasks((current) => [
        {
          id: `task-${Date.now()}`,
          title: trimmedTitle,
          deadline: trimmedDeadline,
          completed: false,
        },
        ...current,
      ]);
    };

    const toggleCommunityCompletion = () => {
      setCommunity((current) => {
        const previousCompletedCount = current.members.filter(
          (member) => member.completedToday,
        ).length;
        const previousEveryoneDone =
          previousCompletedCount === current.members.length;

        const nextMembers = current.members.map((member) =>
          member.id === user.id
            ? { ...member, completedToday: !member.completedToday }
            : member,
        );

        const nextCompletedCount = nextMembers.filter(
          (member) => member.completedToday,
        ).length;
        const nextEveryoneDone = nextCompletedCount === nextMembers.length;
        const currentUserWasComplete = current.members.find(
          (member) => member.id === user.id,
        )?.completedToday;

        setUser((currentUser) => {
          let nextCoins = currentUser.coins;

          if (currentUserWasComplete) {
            nextCoins -= 1;
          } else {
            nextCoins += 1;
          }

          if (!previousEveryoneDone && nextEveryoneDone) {
            nextCoins += 2;
          }

          if (previousEveryoneDone && !nextEveryoneDone) {
            nextCoins -= 2;
          }

          return { ...currentUser, coins: Math.max(0, nextCoins) };
        });

        return {
          ...current,
          members: nextMembers,
        };
      });
    };

    const createCommunityTask = (title: string) => {
      const trimmedTitle = title.trim();

      if (!trimmedTitle) {
        return;
      }

      setCommunity((current) => ({
        ...current,
        currentTaskTitle: trimmedTitle,
        members: current.members.map((member) => ({
          ...member,
          completedToday: false,
        })),
      }));
    };

    const joinCommunity = (code: string) => {
      if (code.trim().toUpperCase() !== community.code) {
        return {
          ok: false,
          message: "That code does not match this prototype community.",
        };
      }

      return {
        ok: true,
        message: `Joined ${community.name}. In the prototype, you are already in this community.`,
      };
    };

    const buyUnlockable = (unlockableId: string) => {
      const target = unlockables.find(
        (unlockable) => unlockable.id === unlockableId,
      );

      if (!target) {
        return { ok: false, message: "That cosmetic could not be found." };
      }

      if (target.purchased) {
        return {
          ok: true,
          message: `${target.name} is already in your collection.`,
        };
      }

      if (user.coins < target.price) {
        return {
          ok: false,
          message: "Not enough coins for that cosmetic yet.",
        };
      }

      setUser((current) => ({
        ...current,
        coins: current.coins - target.price,
      }));
      setUnlockables((current) =>
        current.map((unlockable) =>
          unlockable.id === unlockableId
            ? { ...unlockable, purchased: true }
            : unlockable,
        ),
      );

      return {
        ok: true,
        message: `${target.name} unlocked for your community plant.`,
      };
    };

    const equipUnlockable = (unlockableId: string) => {
      const target = unlockables.find(
        (unlockable) => unlockable.id === unlockableId,
      );

      if (!target || !target.purchased) {
        return;
      }

      setEquipped((current) => ({
        ...current,
        [target.category]: unlockableId,
      }));
    };

    const signInMock = (payload: SignInPayload) => {
      setUser((current) => ({
        ...current,
        name: payload.name?.trim() || current.name,
        firstName: payload.name?.trim()?.split(" ")[0] || current.firstName,
        email: payload.email.trim() || current.email,
        signedIn: true,
      }));
    };

    return {
      user,
      community,
      personalTasks,
      unlockables,
      equipped,
      completionRate,
      completedCount,
      isOwner,
      togglePersonalTask,
      addPersonalTask,
      toggleCommunityCompletion,
      createCommunityTask,
      joinCommunity,
      buyUnlockable,
      equipUnlockable,
      signInMock,
    };
  }, [
    community,
    completionRate,
    completedCount,
    equipped,
    isOwner,
    personalTasks,
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
