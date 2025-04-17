import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import PaymentModeScreen from './pages/PaymentModeScreen';
import TableConnection from './pages/TableConnection';
import ItemSelectionScreen from './pages/ItemSelectionScreen';
import useStore from './store/useStore';
import PaymentScreen from './pages/PaymentScreen';
import { disconnect, socket } from './services/socket';
import { RandomPayerScreen } from './pages/RandomPayerScreen';

function App() {
  const { setCurrentUser, setTableNumber } = useStore();

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedTable = localStorage.getItem('tableNumber');
  
    if (savedUser && savedTable) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setTableNumber(savedTable);
  
      if (!socket.connected) {
        socket.connect();
      }
  
      socket.emit('join_table', { tableNumber: savedTable, user });
    }
  
    return () => {
      disconnect();
    };
  }, [setCurrentUser, setTableNumber]);  


  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/tableconnection" element={<TableConnection />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/payment-mode" element={<PaymentModeScreen />} />
      <Route path="/itemselect" element={<ItemSelectionScreen />} />
      <Route path="/payment" element={<PaymentScreen />} />
      <Route path="/random" element={<RandomPayerScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;