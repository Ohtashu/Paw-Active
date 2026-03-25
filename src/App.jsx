import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Login          from './pages/Login';
import SignUp         from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Home           from './pages/Home';
import Book           from './pages/Book';
import History        from './pages/History';
import BookingDetail  from './pages/BookingDetail';
import Wallet         from './pages/Wallet';
import Pets           from './pages/Pets';
import Profile        from './pages/Profile';

function PrivateRoute({ children }) {
  const { authUser, loading } = useApp();
  if (loading || authUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading…</p>
        </div>
      </div>
    );
  }
  return authUser ? children : <Navigate to="/" replace />;
}

function PublicRoute({ children }) {
  const { authUser, loading } = useApp();
  if (loading || authUser === undefined) return null;
  return authUser ? <Navigate to="/home" replace /> : children;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"               element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup"         element={<PublicRoute><SignUp /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

          {/* Authenticated */}
          <Route path="/home"           element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/book"           element={<PrivateRoute><Book /></PrivateRoute>} />
          <Route path="/history"        element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="/history/:id"    element={<PrivateRoute><BookingDetail /></PrivateRoute>} />
          <Route path="/wallet"         element={<PrivateRoute><Wallet /></PrivateRoute>} />
          <Route path="/pets"           element={<PrivateRoute><Pets /></PrivateRoute>} />
          <Route path="/profile"        element={<PrivateRoute><Profile /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
