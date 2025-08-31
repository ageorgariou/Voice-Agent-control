import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import ContactManager from './components/ContactManager';
import Management from './components/Management';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/contact-manager" 
            element={
              <ProtectedRoute>
                <ContactManager />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/management" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Management />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;