import { Server } from 'socket.io';
import * as http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:4000',
    methods: ['GET', 'POST'],
  },
  path: '/socket.io',
});

// Типы
interface User {
  id: string;
  name: string;
  socketId?: string;
}

interface DishAssignment {
  dishId: string;
  userId: string;
  tableNumber: string;
  name: string;
  price: number;
}

interface SelectedDish {
  dishId: string;
  name: string;
  price: number;
  assignedTo: string[];
}

// Состояние в памяти
const tableUsers: Record<string, Array<User>> = {};
const tableDishes: Record<string, Array<SelectedDish>> = {};

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('join_table', ({ tableNumber, user }: { tableNumber: string; user: User }) => {
    socket.join(tableNumber);

    if (!tableUsers[tableNumber]) {
      tableUsers[tableNumber] = [];
    }

    const userWithSocket = { ...user, socketId: socket.id };
    tableUsers[tableNumber] = tableUsers[tableNumber].filter((u) => u.id !== user.id);
    tableUsers[tableNumber].push(userWithSocket);

    if (!tableDishes[tableNumber]) {
      tableDishes[tableNumber] = [];
    }

    io.to(tableNumber).emit('table_users', tableUsers[tableNumber]);
    io.to(tableNumber).emit('table_dishes', tableDishes[tableNumber]);
  });

  socket.on('dish_assigned', (data: DishAssignment | null) => {
    if (!data) {
      console.warn('❗️Получено пустое значение dish_assigned');
      return;
    }

    const { dishId, userId, tableNumber, name, price } = data;
    if (!tableNumber) return;

    if (!tableDishes[tableNumber]) {
      tableDishes[tableNumber] = [];
    }

    const dishIndex = tableDishes[tableNumber].findIndex((d) => d.dishId === dishId);

    if (dishIndex === -1) {
      tableDishes[tableNumber].push({ dishId, name, price, assignedTo: [userId] });
    } else {
      const dish = tableDishes[tableNumber][dishIndex];
      if (!dish.assignedTo.includes(userId)) {
        dish.assignedTo.push(userId);
      } else {
        dish.assignedTo = dish.assignedTo.filter((id) => id !== userId);
        if (dish.assignedTo.length === 0) {
          tableDishes[tableNumber].splice(dishIndex, 1);
        }
      }
    }

    io.to(tableNumber).emit('table_dishes', tableDishes[tableNumber]);
  });

  socket.on('dish_removed', ({ dishId, userId }: { dishId: string; userId: string }) => {
    for (const table in tableDishes) {
      const dish = tableDishes[table].find((d) => d.dishId === dishId);
      if (dish) {
        dish.assignedTo = dish.assignedTo.filter((id) => id !== userId);
        if (dish.assignedTo.length === 0) {
          tableDishes[table] = tableDishes[table].filter((d) => d.dishId !== dishId);
        }
        io.to(table).emit('table_dishes', tableDishes[table]);
      }
    }
  });

  socket.on('dish_split', ({ dishId, userIds }: { dishId: string; userIds: string[] }) => {
    for (const table in tableDishes) {
      const dish = tableDishes[table].find((d) => d.dishId === dishId);
      if (dish) {
        dish.assignedTo = userIds;
        io.to(table).emit('table_dishes', tableDishes[table]);
      }
    }
  });

  socket.on('tip_updated', (amount: number) => {
    io.emit('tip_updated', amount);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);

    let disconnectedUserId: string | null = null;

    for (const table in tableUsers) {
      const users = tableUsers[table];
      const user = users.find((u) => u.socketId === socket.id);
      if (user) {
        disconnectedUserId = user.id;
        tableUsers[table] = users.filter((u) => u.socketId !== socket.id);
        io.to(table).emit('table_users', tableUsers[table]);
      }
    }

    if (disconnectedUserId) {
      for (const table in tableDishes) {
        tableDishes[table].forEach((dish) => {
          dish.assignedTo = dish.assignedTo.filter((id) => id !== disconnectedUserId);
        });
        tableDishes[table] = tableDishes[table].filter((d) => d.assignedTo.length > 0);
        io.to(table).emit('table_dishes', tableDishes[table]);
      }
    }
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
