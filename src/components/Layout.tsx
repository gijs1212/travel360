import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { useAuth } from '../providers/AuthProvider';
import { cn } from '../utils/cn';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-primary-100 text-primary-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  );

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { profile, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-primary-600">
            <span>Travel360</span>
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">beta</span>
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink to="/" className={navLinkClass} end>
              Reizen
            </NavLink>
            {profile?.role === 'uploader' && (
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {loading ? (
              <span className="text-sm text-slate-500">Bezig...</span>
            ) : profile ? (
              <>
                <span className="text-sm text-slate-600">Hallo, {profile.username}</span>
                <Button variant="secondary" onClick={handleSignOut}>
                  Uitloggen
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  Inloggen
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  Account maken
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </main>
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-6xl px-4 text-sm text-slate-500">
          Gemaakt voor Gijs — versie {__APP_VERSION__}
        </div>
      </footer>
    </div>
  );
};
