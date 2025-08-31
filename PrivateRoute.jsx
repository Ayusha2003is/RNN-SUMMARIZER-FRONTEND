// Component/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const isAuthenticated = localStorage.getItem('auth'); // or your logic

  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default PrivateRoute;