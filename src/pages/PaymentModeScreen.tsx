import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  Users, 
  SplitSquareHorizontal,
  ListChecks, 
  SquareDot
} from 'lucide-react';

function PaymentModeScreen() {
  const navigate = useNavigate();

  const handleModeSelection2 = () => {
    console.log('Selected mode: full');
    navigate('/payment', { state: { fullPayment: true } });
  };

  const handleModeSelection3 = () => {
    console.log('Selected mode: lycky');
    navigate('/random');
  };

  const handleModeSelection4 = () => {
    console.log('Selected mode: equal');
    navigate('/payment', { state: { mode: 'equal' } });
  };  

  const handleModeSelection = (mode: 'individual' | 'custom') => {
    console.log('Selected mode:', mode);
    navigate('/itemselect');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#e7fbe9]">
      <div className="max-w-md w-full space-y-8  p-8 rounded-2xl shadow-xl bg-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Как вы хотите разделить чек?
          </h2>
          <p className="mt-2 text-gray-600">
            Выберите удобный метод
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={handleModeSelection2}
            className="flex items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
          >
            <Wallet className="w-6 h-6 text-purple-600 mr-3" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Оплатить весь счет</h3>
              <p className="text-sm text-gray-500">
                Вы заплатите всю сумму
              </p>
            </div>
          </button>

          <button
            onClick={() => handleModeSelection('individual')}
            className="flex items-center p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors"
          >
            <ListChecks className="w-6 h-6 text-pink-600 mr-3" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Заплатить за себя</h3>
              <p className="text-sm text-gray-500">
                Выбирайте только свои товары
              </p>
            </div>
          </button>

          <button
            onClick={() => handleModeSelection3()}
            className="flex items-center p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
          >
            <SquareDot className="w-6 h-6 text-red-400 mr-3" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Счастливый выбор</h3>
              <p className="text-sm text-gray-500">
                Счастливчик платит
              </p>
            </div>
          </button>

          <button
            onClick={() => handleModeSelection4()}
            className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <Users className="w-6 h-6 text-blue-600 mr-3" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Разделить поровну</h3>
              <p className="text-sm text-gray-500">
                Разделите общую сумму поровну
              </p>
            </div>
          </button>

          <button
            onClick={() => handleModeSelection('custom')}
            className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
          >
            <SplitSquareHorizontal className="w-6 h-6 text-green-600 mr-3" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Выбор категории</h3>
              <p className="text-sm text-gray-500">
                Разделение продуктов по категориям
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentModeScreen;