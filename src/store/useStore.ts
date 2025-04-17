import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { User, Bill, DishItem } from '../types';

interface Store {
  currentUser: User | null;
  users: User[];
  bill: Bill | null;
  activeUsers: User[];
  selectedItems: { [key: string]: DishItem };
  tableNumber: string | null;
  guestName: string;
  lastUpdate: number;
  recognizedDishes: DishItem[];

  setCurrentUser: (user: User | null) => void;
  setUserAvatar: (avatar: string) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  setBill: (bill: Bill) => void;
  setTableNumber: (tableNumber: string) => void;
  assignDishToUser: (dishId: string, userId: string, name: string, price: number) => void;
  splitDish: (dishId: string, userIds: string[]) => void;
  setTip: (amount: number) => void;
  addToSelectedItems: (item: DishItem) => void;
  removeFromSelectedItems: (itemId: string) => void;
  updateLastActivity: () => void;
  cleanupInactiveUsers: () => void;
  syncTableState: (items: DishItem[]) => void;
  setUsers: (users: User[]) => void;
  setGuestName: (name: string) => void;
  clearSession: () => void;
  setRecognizedDishes: (dishes: DishItem[]) => void;
  clearRecognizedDishes: () => void;
}

const ACTIVITY_TIMEOUT = 30000;

const savedUser = localStorage.getItem('currentUser');
const savedTable = localStorage.getItem('tableNumber');

const useStore = create<Store>()(
  subscribeWithSelector((set, get) => ({
    currentUser: savedUser ? JSON.parse(savedUser) : null,
    tableNumber: savedTable || null,
    users: [],
    bill: null,
    activeUsers: [],
    selectedItems: {},
    recognizedDishes: [],
    guestName: '',
    lastUpdate: Date.now(),

    setGuestName: (name) => set({ guestName: name, lastUpdate: Date.now() }),

    setCurrentUser: (user) => {
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('currentUser');
      }
      set((state) => ({
        currentUser: user,
        users: user ? [...state.users.filter((u) => u.id !== user.id), user] : state.users,
        activeUsers: user ? [...state.activeUsers.filter((u) => u.id !== user.id), user] : state.activeUsers,
        lastUpdate: Date.now(),
      }));
    },

    setUserAvatar: (avatar) =>
      set((state) => {
        if (!state.currentUser) return state;

        const updatedUser: User = { ...state.currentUser, avatar };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        return {
          currentUser: updatedUser,
          users: state.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
          lastUpdate: Date.now(),
        };
      }),

    clearSession: () => {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('tableNumber');
      set({ currentUser: null, tableNumber: null });
    },

    setUsers: (users) =>
      set((state) => {
        const current = state.currentUser;
        const alreadyIncluded = users.find((u) => u.id === current?.id);
        const finalUsers = alreadyIncluded || !current ? users : [...users, current];
        return {
          users: finalUsers,
          activeUsers: finalUsers,
          lastUpdate: Date.now(),
        };
      }),
    

    addUser: (user) =>
      set((state) => ({
        users: [...state.users.filter((u) => u.id !== user.id), user],
        activeUsers: [...state.activeUsers.filter((u) => u.id !== user.id), user],
        lastUpdate: Date.now(),
      })),

    removeUser: (userId) =>
      set((state) => ({
        users: state.users.filter((u) => u.id !== userId),
        activeUsers: state.activeUsers.filter((u) => u.id !== userId),
        lastUpdate: Date.now(),
      })),

    setBill: (bill) =>
      set({
        bill,
        lastUpdate: Date.now(),
      }),

    setTableNumber: (tableNumber) => {
      if (tableNumber) {
        localStorage.setItem('tableNumber', tableNumber);
      } else {
        localStorage.removeItem('tableNumber');
      }
      set({
        tableNumber,
        lastUpdate: Date.now(),
      });
    },

    assignDishToUser: (dishId, userId, name, price) =>
      set((state) => {
        const existing = state.selectedItems[dishId];
        const newItem: DishItem = existing ?? {
          id: dishId,
          name,
          price,
          assignedTo: [],
          splitCount: 1,
        };

        const updatedAssigned = Array.from(new Set([...newItem.assignedTo, userId]));

        return {
          selectedItems: {
            ...state.selectedItems,
            [dishId]: {
              ...newItem,
              assignedTo: updatedAssigned,
              splitCount: updatedAssigned.length,
            },
          },
          lastUpdate: Date.now(),
        };
      }),

    splitDish: (dishId, userIds) =>
      set((state) => {
        const existing = state.selectedItems[dishId];
        if (!existing) return {};
        return {
          selectedItems: {
            ...state.selectedItems,
            [dishId]: {
              ...existing,
              assignedTo: userIds,
              splitCount: userIds.length,
            },
          },
          lastUpdate: Date.now(),
        };
      }),

    setTip: (amount) =>
      set((state) => {
        const tipItemId = 'tip_item';
        const updatedItems = { ...state.selectedItems };
        if (amount < 0) amount = 0;

        if (amount > 0) {
          updatedItems[tipItemId] = {
            id: tipItemId,
            name: 'Чаевые',
            price: amount,
            assignedTo: ['everyone'],
            splitCount: 1,
          };
        } else {
          delete updatedItems[tipItemId];
        }

        return {
          selectedItems: updatedItems,
          lastUpdate: Date.now(),
        };
      }),

    addToSelectedItems: (item) =>
      set((state) => ({
        selectedItems: {
          ...state.selectedItems,
          [item.id]: item,
        },
        lastUpdate: Date.now(),
      })),

    removeFromSelectedItems: (itemId) =>
      set((state) => {
        const newSelectedItems = { ...state.selectedItems };
        delete newSelectedItems[itemId];
        return {
          selectedItems: newSelectedItems,
          lastUpdate: Date.now(),
        };
      }),

    updateLastActivity: () =>
      set(() => ({
        lastUpdate: Date.now(),
      })),

    cleanupInactiveUsers: () =>
      set((state) => {
        const now = Date.now();
        const activeUsers = state.activeUsers.filter(
          (user) => now - state.lastUpdate < ACTIVITY_TIMEOUT
        );
        return {
          activeUsers,
          lastUpdate: now,
        };
      }),

    syncTableState: (items: DishItem[]) =>
      set(() => ({
        selectedItems: items.reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {} as { [key: string]: DishItem }),
        lastUpdate: Date.now(),
      })),

    setRecognizedDishes: (dishes) =>
      set(() => ({ recognizedDishes: dishes })),

    clearRecognizedDishes: () => set({ recognizedDishes: [] }),
  }))
);

setInterval(() => {
  useStore.getState().cleanupInactiveUsers();
}, ACTIVITY_TIMEOUT);

useStore.subscribe(
  (state) => state.lastUpdate,
  () => {
    useStore.getState().updateLastActivity();
  }
);

export default useStore;