// RandomPayerScreen.tsx
import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import {getRandomAvatar} from '../utils/avatars'

export const RandomPayerScreen = () => {
  const { setUsers, setCurrentUser } = useStore();

  const [inputName, setInputName] = useState('');
  const [nameList, setNameList] = useState<string[]>([]);
  const [usersReady, setUsersReady] = useState(false);
  const [selectedPayer, setSelectedPayer] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  const handleAddName = () => {
    if (inputName.trim() !== '') {
      setNameList((prev) => [...prev, inputName.trim()]);
      setInputName('');
    }
  };

  const handleStart = () => {
    const generatedUsers = nameList.map((name, index) => ({
      id: crypto.randomUUID(),
      name,
      avatar: getRandomAvatar(),
      color: '#000000',
      isGuest: true,
    }));

    setUsers(generatedUsers);
    setCurrentUser(generatedUsers[0]);
    setUsersReady(true);
  };

  const handleRandomPick = () => {
    setSpinning(true);
    const totalRounds = 20;
    let currentIndex = 0;
    const interval = setInterval(() => {
      setHighlightedIndex(currentIndex % nameList.length);
      currentIndex++;
      if (currentIndex === totalRounds) {
        clearInterval(interval);
        const winner = nameList[(currentIndex - 1) % nameList.length];
        setTimeout(() => {
          setSpinning(false);
          setSelectedPayer(winner);
        }, 500);
      }
    }, 100);
  };

  const handleGenerateQR = () => {
    alert('QR сгенерирован! (Заглушка)');
  };

  if (!usersReady) {
    return (
      <div className="p-4 flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4">Введите имена участников</h2>

        <div className="flex gap-2 mb-4">
          <input
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder="Имя"
            className="border rounded px-3 py-2"
          />
          <button
            onClick={handleAddName}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Добавить
          </button>
        </div>

        <ul className="mb-4">
          {nameList.map((name, idx) => (
            <li key={idx} className="text-lg">{name}</li>
          ))}
        </ul>

        {nameList.length > 1 && (
          <button
            onClick={handleStart}
            className="px-6 py-3 bg-green-500 text-white rounded-full"
          >
            Начать
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-center">
      <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-6">
        {nameList.map((name, index) => {
          const isHighlighted = highlightedIndex === index;
          const isWinner = selectedPayer === name;
          return (
            <div
              key={name}
              className={`flex items-center gap-2 p-2 rounded-xl border shadow transition-transform duration-200 ${
                isHighlighted ? 'bg-yellow-200 scale-105' : 'bg-white'
              } ${isWinner ? 'ring-4 ring-green-400 animate-pulse' : ''}`}
            >
              <img
                src={getRandomAvatar()}
                alt={name}
                className="w-10 h-10 rounded-full"
              />
              <span className="font-medium">{name}</span>
            </div>
          );
        })}
      </div>

      {!selectedPayer && (
        <button
          onClick={handleRandomPick}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-green-400 to-lime-500 text-white rounded-full text-lg shadow-lg animate-bounce hover:scale-105 transition"
        >
          🎲 Запустить выбор
        </button>
      )}

      {spinning && <div className="mt-6 text-xl animate-pulse">🎲 Вращаем кубик...</div>}

      {selectedPayer && (
        <>
          <div className="mt-6 text-2xl font-bold">
            Оплачивает: <span className="text-blue-700 animate-bounce">{selectedPayer}</span>
          </div>
          <button
            onClick={handleGenerateQR}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-full text-lg hover:bg-blue-700 transition"
          >
            📱 Сгенерировать QR
          </button>
        </>
      )}
    </div>
  );
};
