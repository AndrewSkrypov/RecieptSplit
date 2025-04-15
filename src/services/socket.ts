import { io } from 'socket.io-client';
import useStore from '../store/useStore';
import { User, DishItem } from '../types';

export const socket = io('http://localhost:4000', {
  transports: ['websocket'],
  path: '/socket.io',
});

// 📦 При подключении
socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server');

  const savedTable = localStorage.getItem('tableNumber');
  const savedUser = localStorage.getItem('currentUser');

  if (savedTable && savedUser) {
    const user: User = JSON.parse(savedUser);
    joinTable(savedTable, user);
  }
});

socket.on('connect_error', (error) => {
  console.error('❌ WebSocket connection error:', error);
});

socket.on('disconnect', () => {
  console.log('🔌 Disconnected from WebSocket server');
});

// 👥 Обновление пользователей
socket.on('table_users', (users: User[]) => {
  useStore.getState().setUsers(users);
});

// 🍽 Обновление выбранных блюд
socket.on('table_dishes', (dishes: any) => {
  if (!Array.isArray(dishes)) {
    console.warn('[socket] Некорректный формат table_dishes:', dishes);
    return;
  }

  const parsedItems: { [key: string]: DishItem } = {};

  dishes.forEach((dish: any) => {
    parsedItems[dish.dishId] = {
      id: dish.dishId,
      name: dish.name,
      price: dish.price,
      assignedTo: dish.assignedTo,
      splitCount: dish.assignedTo.length,
    };
  });

  useStore.getState().syncTableState(Object.values(parsedItems));
});

// 📌 Назначение блюда
socket.on('dish_assigned', ({ dishId, userId, name, price }: any) => {
  if (!dishId || !userId) return;
  useStore.getState().assignDishToUser(dishId, userId, name, price);
});

// 🗑 Удаление выбора блюда
socket.on('dish_removed', ({ dishId, userId }: { dishId: string; userId: string }) => {
  const state = useStore.getState();
  const item = state.selectedItems[dishId];

  if (item) {
    const remaining = item.assignedTo.filter((id) => id !== userId);
    if (remaining.length === 0) {
      state.removeFromSelectedItems(dishId);
    } else {
      state.assignDishToUser(dishId, remaining[0], item.name, item.price);
    }
  }
});

// 🔀 Разделение блюда
socket.on('dish_split', ({ dishId, userIds }: { dishId: string; userIds: string[] }) => {
  useStore.getState().splitDish(dishId, userIds);
});

// 💸 Обновление чаевых
socket.on('tip_updated', (amount: number) => {
  useStore.getState().setTip(amount);
});

// 🔁 Подключение к столу
export const joinTable = (tableNumber: string, user: User) => {
  if (!socket.connected) {
    socket.connect();
  }

  socket.emit('join_table', { tableNumber, user });
  useStore.getState().setTableNumber(tableNumber);
  useStore.getState().setCurrentUser(user);
  localStorage.setItem('tableNumber', tableNumber);
  localStorage.setItem('currentUser', JSON.stringify(user));
};

// 📤 Emit-функции
export const emitDishAssigned = (
  dishId: string,
  userId: string,
  tableNumber: string,
  name: string,
  price: number
) => {
  socket.emit('dish_assigned', { dishId, userId, tableNumber, name, price });
};

export const emitRemoveDish = (payload: { dishId: string; userId: string }) => {
  socket.emit('dish_removed', payload);
};

export const emitDishSplit = (dishId: string, userIds: string[]) => {
  socket.emit('dish_split', { dishId, userIds });
};

export const emitTipUpdated = (amount: number) => {
  socket.emit('tip_updated', amount);
};

export const disconnect = () => {
  socket.disconnect();
  localStorage.removeItem('tableNumber');
  localStorage.removeItem('currentUser');
};
