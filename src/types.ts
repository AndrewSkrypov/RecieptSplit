// types.ts

export interface User {
  id: string;
  name: string;
  color: string;
  isGuest: boolean;
  tableNumber?: string;
  avatar: string,
}

export interface DishItem {
  id: string;              // уникальный идентификатор блюда
  name: string;            // название блюда
  price: number;           // цена
  assignedTo: string[];    // список ID пользователей, выбравших это блюдо
  splitCount: number;      // на сколько частей поделено
}

export interface Bill {
  id: string;
  items: DishItem[];
  tip: number;
  receiptImage?: string;
  splitMode: 'full' | 'individual' | 'equal' | 'custom';
  total: number;
}

export interface Dish {
  id: string;
  name: string;
  price: number;
}
