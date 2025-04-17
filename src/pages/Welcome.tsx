import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import useStore from '../store/useStore';

function Welcome() {
  const [guestName, setGuestNameLocal] = useState(''); // Локальное состояние
  const setGuestName = useStore((state) => state.setGuestName);
  const navigate = useNavigate();

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGuestName(guestName); // сохраняем в Zustand
    navigate('/tableconnection');
  };

  return (
    <div className="min-h-screen bg-[#f2fff5] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

      <div className="flex items-center justify-left gap-2 mb-2">
        <img
          src="/avatars/avatar1.jpg"
          alt="котик"
          className="w-12 h-12 rounded-full"
        />
        <h1 className="text-3xl font-bold text-gray-900">Добро пожаловать!</h1>
      </div>

        <p className="text-green-600 mb-8 text-center">Это сервис для удобного деления счёта</p>
        
        <p className="text-gray-600 mb-4 text-center">Выберите как вы хотите продолжить</p>

        <button
          onClick={() => navigate('/login')}
          className="w-full bg-green-500 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors mb-6"
        >
          <User size={20} />
          Войти / Регистрация
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Продолжить как Гость</span>
          </div>
        </div>

        <form onSubmit={handleGuestSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="guestName" className="block text-sm text-gray-700 mb-1">
                Ваше имя
              </label>
              <input
                type="text"
                id="guestName"
                value={guestName}
                onChange={(e) => setGuestNameLocal(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#fff7e6] border-transparent focus:border-green-500 focus:ring-0"
                placeholder="Введите ваше имя"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <User size={20} />
              Продолжить как Гость
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Welcome;
