import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAdmin: boolean;
}

export default function ProtectedRoute({ children, isAdmin }: ProtectedRouteProps) {
  const location = useLocation();
  const isAdminRoute = location.pathname === '/management';
  
  // Check if user is admin for admin routes
  if (isAdminRoute && !isAdmin) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
} 