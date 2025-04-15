import React, { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, Camera, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../services/socket';
import useStore from '../store/useStore';

function TableConnection() {
  const [tableCode, setTableCode] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const guestName = useStore.getState().guestName;
  
    if (!guestName || !tableCode) {
      alert('Пожалуйста, введите имя и код стола');
      return;
    }
  
    // Подключаем сокет, если еще не подключен
    if (!socket.connected) {
      socket.connect();
    }
  
    // Ждем, пока socket.id появится (в цикле или через событие)
    const waitForSocketId = (): Promise<string> =>
      new Promise((resolve) => {
        if (socket.id) return resolve(socket.id);
        socket.once('connect', () => resolve(socket.id!));
      });
  
    const socketId = await waitForSocketId();
  
    const user = {
      id: socketId,
      name: guestName,
      tableNumber: tableCode,
      color: '#34D399',
      isGuest: true,
    };
  
    useStore.getState().setCurrentUser(user);
    useStore.getState().setTableNumber(tableCode);
  
    socket.emit('join_table', { tableNumber: tableCode, user });
    navigate('/payment-mode');
  };  

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      // Handle image upload logic here
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedImage(e.dataTransfer.files[0]);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#f2fff5] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="text-green-500 flex items-center gap-2 hover:text-green-600 transition-colors"
          >
            <ArrowLeft size={20} />
            Назад
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Разделите счёт за пару кликов!
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Загрузите чек или присоединяйтесь к столу по коду.
        </p>

        <div className="mb-8">
          <div
            className={`relative group cursor-pointer ${
              selectedImage ? 'bg-green-50' : ''
            }`}
            onClick={() => !selectedImage && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div
              className={`
                border-2 ${isDragging ? 'border-green-600' : 'border-dashed border-green-500'}
                rounded-lg p-6 transition-all duration-200
                ${selectedImage ? 'bg-green-50' : 'hover:bg-green-50'}
                ${isDragging ? 'bg-green-50 scale-102' : ''}
              `}
            >
              {!selectedImage ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Upload size={24} className="text-green-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-green-600 font-medium mb-1">
                      Загрузка чека
                    </p>
                    <p className="text-sm text-gray-500">
                      Перетащите файл сюда или нажмите для выбора
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Camera size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                        {selectedImage.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedImage.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSelectedImage();
                    }}
                    className="p-1 hover:bg-green-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-green-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="tableCode" className="block text-sm text-gray-700 mb-1">
                Введите пригласительный код
              </label>
              <input
                type="text"
                id="tableCode"
                value={tableCode}
                onChange={(e) => setTableCode(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#fff7e6] border-transparent focus:border-green-500 focus:ring-0"
                placeholder="Введите код стола"
              />
            </div>

            <button
              type="submit"
              disabled={!tableCode}
              className="w-full bg-green-500 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Присоединиться к столу
              <ArrowRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TableConnection;