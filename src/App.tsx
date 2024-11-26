import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import ROICalculator from './components/ROICalculator';
import AutomatedSMS from './components/AutomatedSMS';
import ContractForms from './components/ContractForms';
import ContactManager from './components/ContactManager';
import Management from './components/Management';
import PasswordProtectedRoute from './components/PasswordProtectedRoute';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userName = localStorage.getItem('userName');
    const userPassword = localStorage.getItem('userPassword');
    setIsAdmin(userName === 'admin' && userPassword === '12345');
  }, [isLoggedIn]);

  const handleLogin = (username: string) => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('userName');
    localStorage.removeItem('userPassword');
    localStorage.removeItem('currentUser');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard onLogout={handleLogout} />} />
        <Route path="/roi-calculator" element={<ROICalculator />} />
        <Route path="/automated-sms" element={<AutomatedSMS />} />
        <Route path="/contract-forms" element={<ContractForms />} />
        <Route path="/contact-manager" element={<ContactManager />} />
        <Route 
          path="/management" 
          element={
            <PasswordProtectedRoute isAdmin={isAdmin}>
              <Management />
            </PasswordProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;