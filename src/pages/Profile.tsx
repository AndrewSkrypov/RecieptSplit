import React, { useState } from 'react';
import { Share2, Edit2, Upload, Trophy, ArrowRight, X, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [receiptAmount, setReceiptAmount] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile && receiptAmount) {
      console.log('Uploading file:', selectedFile, 'Amount:', receiptAmount);
      setIsModalOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setReceiptAmount('');
      navigate('/payment-mode');
    }
  };

  return (
    <div className="min-h-screen bg-[#f2fff5] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Личный кабинет</h1>
          <Share2 className="text-green-500 cursor-pointer hover:text-green-600" />
        </div>

        {/* Profile Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <img
              src="https://images.unsplash.com/photo-1533738363-b7f9aef128ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80"
              alt="Profile"
              className="w-24 h-24 rounded-full mx-auto mb-4"
            />
          </div>
          <h2 className="text-xl font-semibold mb-2">Метла</h2>
          <button className="text-green-500 flex items-center justify-center gap-2 mx-auto hover:text-green-600">
            <Edit2 size={16} />
            Редактировать профиль
          </button>
        </div>

        {/* Upload Check Section */}
        <div className="border-2 border-dashed border-green-200 rounded-lg p-4 mb-8">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 text-green-500 hover:text-green-600"
          >
            <Upload size={20} />
            Загрузить чек
          </button>
        </div>

        {/* Invitation Code Section */}
        <div className="mb-8">
          <p className="text-gray-600 mb-2">Введите пригласительный код</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Например: ABC123"
              className="flex-1 px-4 py-2 rounded-lg bg-[#fff7e6] border-transparent focus:border-green-500 focus:ring-0"
            />
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Achievements</h3>
            <button className="text-green-500 text-sm hover:text-green-600">
              Показать все
            </button>
          </div>
          <div className="flex gap-4">
            <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center">
              <Trophy size={24} className="text-green-500" />
            </div>
            <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center">
              <Trophy size={24} className="text-gray-400" />
            </div>
            <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center">
              <Trophy size={24} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div>
          <h3 className="font-semibold mb-4">Статистика за месяц</h3>
          <div className="bg-[#fff7e6] rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Всего чеков:</span>
              <span className="font-semibold">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Общая сумма:</span>
              <span className="font-semibold">₽24,500</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Загрузить чек</h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setReceiptAmount('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label className="block w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <Image size={48} className="mb-2" />
                    <p className="text-sm">Нажмите или перетащите фото чека</p>
                  </div>
                </label>
              )}

              <div>
                <label htmlFor="amount" className="block text-sm text-gray-700 mb-1">
                  Сумма чека
                </label>
                <input
                  type="number"
                  id="amount"
                  value={receiptAmount}
                  onChange={(e) => setReceiptAmount(e.target.value)}
                  placeholder="Введите сумму"
                  className="w-full px-4 py-3 rounded-lg bg-[#fff7e6] border-transparent focus:border-green-500 focus:ring-0"
                  required
                />
              </div>

              <button
                onClick={handleUpload}
                disabled={!selectedFile || !receiptAmount}
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${
                  selectedFile && receiptAmount
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                } transition-colors`}
              >
                <Upload size={20} />
                Загрузить и продолжить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;