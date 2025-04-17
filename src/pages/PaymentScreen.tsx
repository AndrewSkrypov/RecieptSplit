import React, { useState } from 'react';
import useStore from '../store/useStore';
import { useLocation } from 'react-router-dom';
import {
  emitDishAssigned,
  emitDishSplit,
  emitTipUpdated,
  emitRemoveDish,
  socket,
} from '../services/socket';

const mockItems = [
  { id: '1', name: 'Пицца пипперони', price: 720, assignedTo: [] },
  { id: '2', name: 'Салат цезарь', price: 350, assignedTo: [] },
  { id: '3', name: 'Суп окрошка', price: 200, assignedTo: [] },
  { id: '4', name: 'Тортик', price: 150, assignedTo: [] },
];

function PaymentScreen() {
  const selectedItems = useStore((state) => state.selectedItems);
  const currentUser = useStore((state) => state.currentUser);
  const location = useLocation();

  const fullPayment = location.state?.fullPayment;
  const equalSplit = location.state?.mode === 'equal';

  const [participantCount, setParticipantCount] = useState(1);
  const [participantInput, setParticipantInput] = useState('1');
  const [tipAmount, setTipAmount] = useState(0);

  const items = fullPayment || equalSplit
    ? mockItems
    : Object.values(selectedItems).filter((item) =>
        item.assignedTo?.includes(currentUser?.id || '')
      );

  const total = items.reduce((sum, item) => {
    const splitCount = item.assignedTo?.length || 1;
    const share = fullPayment || equalSplit ? item.price : item.price / splitCount;
    return sum + share;
  }, 0) + tipAmount;

  const perPersonAmount = equalSplit ? total / participantCount : total;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#e7fbe9]">
      <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full space-y-4">
        <h2 className="text-xl font-bold text-center">Оплата заказа</h2>

        {equalSplit && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Количество участников</label>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={3}
                  value={participantInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d{0,3}$/.test(val)) {
                      setParticipantInput(val);
                      setParticipantCount(val === '' ? 1 : parseInt(val));
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value.trim() === '') {
                      setParticipantInput('1');
                      setParticipantCount(1);
                    }
                  }}
                  placeholder="1"
                  className="pl-4 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 text-base shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {items.map((item) => {
            const splitCount = item.assignedTo?.length || 1;
            const share = fullPayment || equalSplit ? item.price : item.price / splitCount;

            return (
              <li key={item.id} className="flex justify-between text-gray-800">
                <span>{item.name}</span>
                <span>₽{share.toFixed(2)}</span>
              </li>
            );
          })}
          {tipAmount > 0 && (
            <li className="flex justify-between text-gray-800">
              <span>Чаевые</span>
              <span>₽{tipAmount.toFixed(2)}</span>
            </li>
          )}
        </ul>

        <div className="mt-8 border-t">
          <label className="block text-sm font-medium text-gray-800 mb-2">Чаевые</label>
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
          </div>
        </div>

        <div className="flex justify-between font-bold text-lg border-t pt-4">
          <span>Итого</span>
          <span>₽{equalSplit ? perPersonAmount.toFixed(2) : total.toFixed(2)}</span>
        </div>

        <button className="w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-700">
          Оплатить картой
        </button>
      </div>
    </div>
  );
}

export default PaymentScreen;
