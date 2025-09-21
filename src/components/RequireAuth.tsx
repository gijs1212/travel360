import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="py-10 text-center text-sm text-slate-500">Bezig met laden...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const RequireUploader = ({ children }: { children: JSX.Element }) => {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="py-10 text-center text-sm text-slate-500">Bezig met laden...</div>;
  }

  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profile.role !== 'uploader') {
    return <Navigate to="/" replace />;
  }

  return children;
};
