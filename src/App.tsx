import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import PaymentModeScreen from './pages/PaymentModeScreen';
import TableConnection from './pages/TableConnection';
import ItemSelectionScreen from './pages/ItemSelectionScreen';
import useStore from './store/useStore';
import { disconnect, socket, joinTable } from './services/socket';

function App() {
  const { setCurrentUser, setTableNumber } = useStore();

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedTable = localStorage.getItem('tableNumber');
  
    if (savedUser && savedTable) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      //socket.connect(); // Только сокет
    }
  
    return () => {
      disconnect();
    };
  }, [setCurrentUser]);


  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/tableconnection" element={<TableConnection />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/payment-mode" element={<PaymentModeScreen />} />
      <Route path="/itemselect" element={<ItemSelectionScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;