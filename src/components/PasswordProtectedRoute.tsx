import { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';

interface PasswordProtectedRouteProps {
  children: React.ReactNode;
  isAdmin: boolean;
}

export default function PasswordProtectedRoute({ children, isAdmin }: PasswordProtectedRouteProps) {
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(60);
  const [showPrompt, setShowPrompt] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if route is locked from localStorage
    const lockedUntil = localStorage.getItem('managementRouteLocked');
    if (lockedUntil) {
      const timeLeft = Math.ceil((parseInt(lockedUntil) - Date.now()) / 1000);
      if (timeLeft > 0) {
        setIsLocked(true);
        setLockTimer(timeLeft);
        startCountdown(timeLeft);
      } else {
        localStorage.removeItem('managementRouteLocked');
      }
    }
  }, []);

  const startCountdown = (duration: number) => {
    const timer = setInterval(() => {
      setLockTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsLocked(false);
          localStorage.removeItem('managementRouteLocked');
          setAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === '123456') {
      setShowPrompt(false);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPassword('');
      
      if (newAttempts >= 3) {
        setIsLocked(true);
        const lockUntil = Date.now() + 60000; // 1 minute from now
        localStorage.setItem('managementRouteLocked', lockUntil.toString());
        startCountdown(60);
      }
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center mb-6">
            <button
              onClick={handleBack}
              className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="bg-red-100 rounded-full p-3 inline-block mb-4">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Access Locked</h2>
            <p className="mt-2 text-gray-600">
              Too many incorrect attempts. Please wait {lockTimer} seconds before trying again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showPrompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center mb-6">
            <button
              onClick={handleBack}
              className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="bg-indigo-100 rounded-full p-3 inline-block mb-4">
              <Lock className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Password Required</h2>
            <p className="mt-2 text-gray-600">
              Please enter the password to access this page.
              {attempts > 0 && (
                <span className="block text-red-600 mt-2">
                  Incorrect password. {3 - attempts} attempts remaining.
                </span>
              )}
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 mb-4"
              placeholder="Enter password"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 