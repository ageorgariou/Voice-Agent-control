import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import ContactManager from './components/ContactManager';
import Management from './components/Management';
import PasswordProtectedRoute from './components/PasswordProtectedRoute';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    const userName = localStorage.getItem('userName');
    
    if (currentUser || userName) {
      setIsLoggedIn(true);
      if (currentUser) {
        const user = JSON.parse(currentUser);
        setIsAdmin(user.username === 'admin');
      } else if (userName === 'admin') {
        setIsAdmin(true);
      }
    }
  }, []);

  const handleLogin = (username: string) => {
    setIsLoggedIn(true);
    setIsAdmin(username === 'admin');
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