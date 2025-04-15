import React, { useState, useEffect } from 'react';
import { DollarSign, Users, ShoppingCart, Trash2 } from 'lucide-react';
import useStore from '../store/useStore';
import {
  emitDishAssigned,
  emitDishSplit,
  emitTipUpdated,
  emitRemoveDish,
  socket,
} from '../services/socket';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';

const mockItems = [
  { id: '1', name: 'Margherita Pizza', price: 12.99 },
  { id: '2', name: 'Caesar Salad', price: 8.99 },
  { id: '3', name: 'Chocolate Cake', price: 6.99 },
  { id: '4', name: 'Cake', price: 6.99 },
];

function ItemSelectionScreen() {
  const navigate = useNavigate();
  const currentUser = useStore((state) => state.currentUser);
  const users = useStore((state) => state.users);
  const selectedItems = useStore((state) => state.selectedItems);
  const assignDishToUser = useStore((state) => state.assignDishToUser);
  const removeFromSelectedItems = useStore((state) => state.removeFromSelectedItems);
  const setUsers = useStore((state) => state.setUsers);

  const [tipAmount, setTipAmount] = useState(0);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showSplitMenu, setShowSplitMenu] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    socket.on('table_dishes', (updatedDishes) => {
      if (!Array.isArray(updatedDishes)) return;
      const stateItems: { [key: string]: any } = {};
      updatedDishes.forEach((dish: any) => {
        stateItems[dish.dishId] = {
          id: dish.dishId,
          name: dish.name,
          price: dish.price,
          assignedTo: dish.assignedTo,
          splitCount: dish.assignedTo.length,
        };
      });
      useStore.getState().syncTableState(Object.values(stateItems));
    });

    socket.on('table_users', (users: User[]) => {
      setUsers(users);
    });

    return () => {
      socket.off('table_dishes');
      socket.off('table_users');
    };
  }, [assignDishToUser, setUsers]);

  const handleDishClick = (dish: { id: string; name: string; price: number }) => {
    if (!currentUser?.id) return;

    const assignedUsers = selectedItems[dish.id]?.assignedTo || [];
    if (assignedUsers.includes(currentUser.id)) {
      removeFromSelectedItems(dish.id);
      emitRemoveDish({ dishId: dish.id, userId: currentUser.id });
    } else if (assignedUsers.length === 0) {
      emitDishAssigned(
        dish.id,
        currentUser.id,
        currentUser.tableNumber || '',
        dish.name,
        dish.price
      );
      assignDishToUser(dish.id, currentUser.id, dish.name, dish.price);
    } else {
      alert('Это блюдо уже выбрано другим пользователем');
    }
  };

  const handleLongPress = (itemId: string) => {
    setSelectedItem(itemId);
    setShowSplitMenu(true);
  };

  const handleTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0 || value > 9999999) return;
    setTipAmount(value);
    emitTipUpdated(value);
  };

  const handleTipBlur = () => {
    if (!tipAmount) setTipAmount(0);
  };

  const handleSplitConfirm = () => {
    if (selectedItem && selectedUsers.length > 0) {
      emitDishSplit(selectedItem, selectedUsers);
      setShowSplitMenu(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  };

  const getItemStyle = (itemId: string) => {
    const item = selectedItems[itemId];
    if (!item) return 'bg-gray-50 hover:bg-gray-100';
    if (item.assignedTo.length > 1) return 'bg-gradient-to-r from-purple-100 to-pink-100';
    return 'bg-opacity-50 shadow-md';
  };

  const handleCartClose = () => {
    setShowCart(false);
  };

  const userItems = Object.values(selectedItems).filter((item) =>
    item.assignedTo.includes(currentUser?.id || '')
  );

  const total = userItems.reduce((sum, item) => sum + item.price, 0) + tipAmount;
  const allDishesSelected = mockItems.every(item => selectedItems[item.id]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-md mx-auto space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Select Items</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-500">{users.length} active users</span>
              </div>
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-gray-500 hover:text-gray-700"
              >
                <ShoppingCart className="w-6 h-6" />
                {userItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {userItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {mockItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleDishClick(item)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleLongPress(item.id);
                }}
                className={`p-4 rounded-xl cursor-pointer transition-all transform hover:scale-102 ${getItemStyle(item.id)}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    {selectedItems[item.id]?.assignedTo.length > 1 && (
                      <span className="ml-2 text-sm text-gray-500">
                        (Split {selectedItems[item.id].assignedTo.length} ways)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">${item.price}</span>
                    {selectedItems[item.id] && (
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Чаевые</label>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-400 text-lg">$</span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={7}
                  value={tipAmount === 0 && isNaN(Number(tipAmount)) ? '' : tipAmount.toString()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d{0,7}$/.test(val)) {
                      setTipAmount(val === '' ? 0 : parseInt(val));
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value.trim() === '') {
                      setTipAmount(0);
                      emitTipUpdated(0);
                    } else {
                      emitTipUpdated(tipAmount);
                    }
                  }}
                  placeholder="0"
                  className="pl-9 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 text-base shadow-sm"
                />
              </div>
              <button
                onClick={() => emitTipUpdated(tipAmount)}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all text-sm font-semibold"
              >
                Add<br />Tip
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>К оплате</span>
              <span>${(total + tipAmount).toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-8">
            <button
              disabled={!allDishesSelected}
              onClick={() => navigate('/payment')}
              className={`w-full py-4 text-white text-center rounded-xl font-bold transition ${
                !allDishesSelected ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              Перейти к оплате
            </button>
          </div>
        </div>

        {showSplitMenu && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl max-w-sm w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Split this item</h3>
              <div className="space-y-3 mb-6">
                {users.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="flex-1">{user.name}</span>
                    {user.tableNumber && (
                      <span className="text-sm text-gray-500">Table {user.tableNumber}</span>
                    )}
                  </label>
                ))}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSplitMenu(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSplitConfirm}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                >
                  Confirm Split
                </button>
              </div>
            </div>
          </div>
        )}

        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl max-w-sm w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Your Cart</h3>
                <button
                  onClick={handleCartClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                {userItems.length > 0 ? (
                  userItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <span>{item.name}</span>
                      <div className="flex items-center space-x-3">
                        <span>${item.price}</span>
                        <button
                          onClick={() => {
                            removeFromSelectedItems(item.id);
                            emitRemoveDish({ dishId: item.id, userId: currentUser?.id || '' });
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Your cart is empty</p>
                )}
              </div>

              {tipAmount > 0 && (
                <div className="mt-4 border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Чаевые</span>
                    <span className="font-semibold">${tipAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="font-bold">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemSelectionScreen;
