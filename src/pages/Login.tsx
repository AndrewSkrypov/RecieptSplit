import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Login submitted:', { email, password });
    navigate('/profile');
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
        <div className="relative mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Вход в аккаунт</h1>
          <p className="text-gray-500 mt-1">Войдите, чтобы продолжить</p>

          <img
            src="/avatars/avatar3.jpg"
            alt="котик"
            className="w-16 h-16 rounded-full absolute right-8 top-1/2 -translate-y-1/2"
          />
        </div>


        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#fff7e6] border-transparent focus:border-green-500 focus:ring-0"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 mb-1">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#fff7e6] border-transparent focus:border-green-500 focus:ring-0"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
            >
              Войти
              <ArrowRight size={20} />
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Нет аккаунта? </span>
          <button 
            onClick={() => navigate('/register')}
            className="text-green-500 hover:text-green-600 transition-colors"
          >
            Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;