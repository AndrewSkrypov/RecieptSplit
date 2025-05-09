import { useState, useEffect } from 'react';
import { Users, ShoppingCart, Trash2 } from 'lucide-react';
import useStore from '../store/useStore';
import {
  emitDishAssigned,
  emitDishSplit,
  emitTipUpdated,
  emitRemoveDish,
  socket,
} from '../services/socket';
import { useNavigate } from 'react-router-dom';
import SwipableDish from './SwipableDish';



const mockItems = [
  { id: '1', name: 'Пицца пипперони', price: 720 },
  { id: '2', name: 'Салат цезарь', price: 350 },
  { id: '3', name: 'Суп окрошка', price: 200 },
  { id: '4', name: 'Тортик', price: 150 },
];

function ItemSelectionScreen() {
  const navigate = useNavigate();
  const currentUser = useStore((state) => state.currentUser);
  const users = useStore((state) => state.users);
  const selectedItems = useStore((state) => state.selectedItems);
  const assignDishToUser = useStore((state) => state.assignDishToUser);
  const removeFromSelectedItems = useStore((state) => state.removeFromSelectedItems);

  const [tipAmount, setTipAmount] = useState(0);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showSplitMenu, setShowSplitMenu] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
  
    return () => {
      socket.off('table_dishes');
    };
  }, []);
  

  //На данном этапе эта функция излишняя
  //useEffect(() => {
  //   socket.on('table_dishes', (updatedDishes) => {
  //     if (!Array.isArray(updatedDishes)) return;
  //     const stateItems: { [key: string]: any } = {};
  //     updatedDishes.forEach((dish: any) => {
  //       stateItems[dish.dishId] = {
  //         id: dish.dishId,
  //         name: dish.name,
  //         price: dish.price,
  //         assignedTo: dish.assignedTo,
  //         splitCount: dish.assignedTo.length,
  //       };
  //     });
  //     useStore.getState().syncTableState(Object.values(stateItems));
  //   });

  //   socket.on('receive_dishes', (dishes) => {
  //     if (!Array.isArray(dishes)) return;
    
  //     const stateItems: { [key: string]: any } = {};
  //     dishes.forEach((dish: any) => {
  //       stateItems[dish.dishId] = {
  //         id: dish.dishId,
  //         name: dish.name,
  //         price: dish.price,
  //         assignedTo: dish.assignedTo || [],
  //         splitCount: dish.assignedTo?.length || 1,
  //       };
  //     });
    
  //     useStore.getState().setRecognizedDishes(Object.values(stateItems));
  //     useStore.getState().syncTableState(Object.values(stateItems));
  //   });
    

  //   socket.on('table_users', (users: User[]) => {
  //     setUsers(users);
  //   });

  //   return () => {
  //     socket.off('table_dishes');
  //     socket.off('table_users');
  //     socket.off('receive_dishes');
  //   };
  // }, [assignDishToUser, setUsers]);

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

  const handleSplitConfirm = () => {
    if (!selectedItem || selectedUsers.length === 0 || !currentUser) return;
    
    const dish = mockItems.find((it) => it.id === selectedItem);
    const existingItem = selectedItems[selectedItem];
  
    if (dish && !existingItem) {
      // создаём блюдо у себя
      assignDishToUser(dish.id, currentUser.id, dish.name, dish.price);
  
      // и сразу говорим серверу
      emitDishAssigned(
        dish.id,
        currentUser.id,
        currentUser.tableNumber || '',
        dish.name,
        dish.price
      );
    }
  
    emitDishSplit(selectedItem, selectedUsers);
    setShowSplitMenu(false);
    setSelectedUsers([]);
  };
  

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]
    );
  };

  const handleCartClose = () => setShowCart(false);

  const userItems = Object.values(selectedItems).filter((item) =>
    item.assignedTo.includes(currentUser?.id || '')
  );

  const total = userItems.reduce((sum, item) => {
    const share = item.assignedTo.length > 0 ? item.price / item.assignedTo.length : item.price;
    return sum + share;
  }, 0) + tipAmount;

  const allDishesSelected = mockItems.every(
    (item) => selectedItems[item.id]?.assignedTo.length > 0
  );
  

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-md mx-auto space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          {/*Шапка профиля*/}
        {currentUser && (
        <div className="flex flex-col items-center mb-6">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover"
          />
          <div className="text-center mt-2">
            <h3 className="text-lg font-semibold text-gray-800">{currentUser.name}</h3>
            <p className="text-sm text-gray-500">
              Код стола: {currentUser.tableNumber || '-'}
            </p>
          </div>
        </div>
      )}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Выбор блюд:</h2>
            <div className="flex items-center space-x-4">
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
              >
                <Users className="w-5 h-5" />
                <span className="text-sm">{users.length} за столом</span>
              </button>
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
          {mockItems.map((item) => {
            const dish = selectedItems[item.id] || {
              id: item.id,
              name: item.name,
              price: item.price,
              assignedTo: [],
              splitCount: 1,
            };

            return (
              <SwipableDish
                key={item.id}
                item={dish}
                currentUserId={currentUser?.id || ''}
                onClick={() => handleDishClick(item)}
                onSplit={() => {
                  setSelectedItem(item.id);
                  setShowSplitMenu(true);
                }}
                price={dish.price}
                assignedTo={dish.assignedTo}
                allUsers={users}
              />
            );
          })}

          </div>

          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Чаевые</label>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
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
                  className="pl-4 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 text-base shadow-sm"
                />
              </div>
              <button
                onClick={() => emitTipUpdated(tipAmount)}
                className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all text-sm font-semibold"
              >
                Добавить<br />чаевые
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>К оплате</span>
              <span>₽{(total).toFixed(2)}</span>
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

        {/* Модальное окно со списком пользователей */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-sm mx-4 relative">
              <h3 className="text-lg font-semibold mb-4 text-center">Активные пользователи</h3>
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
              <ul className="space-y-3">
                {users.map((user) => (
                  <li key={user.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-gray-800">{user.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Модалка разделения */}
        {showSplitMenu && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl max-w-sm w-full mx-4">
              <h3 className="text-lg font-medium text-green-900 mb-4">Разделить блюдо</h3>
              <div className="space-y-3 mb-6">
                {users.map((user) => {
                  const isSelected = selectedUsers.includes(user.id);
                  const selectedCount = selectedUsers.length || 1;
                  const dish = mockItems.find((d) => d.id === selectedItem);
                  const userShare = dish ? (dish.price / selectedCount).toFixed(2) : '-';

                  return (
                    <label
                      key={user.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleUserSelection(user.id)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="flex-1">{user.name}</span>
                      {isSelected && (
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {userShare} ₽
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSplitMenu(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                >
                  Закрыть
                </button>
                <button
                  onClick={handleSplitConfirm}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                >
                  Разделить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Корзина */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl max-w-sm w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Корзина</h3>
                <button onClick={handleCartClose} className="text-gray-400 hover:text-gray-500">✕</button>
              </div>
              <div className="space-y-4">
                {userItems.length > 0 ? (
                  userItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>{item.name}</span>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div>{(item.price / item.assignedTo.length).toFixed(2)} ₽</div>
                          <div className="text-xs text-gray-400">
                            из {item.price.toFixed(2)} ₽
                          </div>
                        </div>
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
                  <p className="text-gray-500 text-center py-4">Корзина пуста</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemSelectionScreen;
