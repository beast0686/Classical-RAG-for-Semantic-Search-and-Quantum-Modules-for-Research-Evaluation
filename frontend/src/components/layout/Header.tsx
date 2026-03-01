import { Link, useLocation } from 'react-router-dom';
import { useSessionStore } from '../../hooks/useSessionStore';
import DatabaseStats from '../common/DatabaseStats';

const Header: React.FC = () => {
  const location = useLocation();
  const sessionId = useSessionStore((s) => s.sessionId);

  return (
    <header className="sticky top-0 z-30 border-b border-medium-gray/50 bg-gradient-to-r from-background/95 via-card/90 to-light-gray/95 backdrop-blur">
      <div className="mx-auto flex max-w-full items-center justify-between px-4 py-3 lg:px-8">
        {/* Left Section - Logo, Branding and Navigation */}
        <div className="flex items-center gap-8 flex-shrink-0">
          {/* Logo and Branding */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-colorful overflow-hidden">
              <img
                src="/neural.png"
                alt="Logo"
                className="h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-text-main sm:text-base">
                Knowledge Graph Studio
              </h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden items-center gap-4 text-sm md:flex">
            {[
              ['/', 'Query'],
              ['/comparison', 'Comparison'],
              ['/metrics', 'Metrics'],
              ['/quantum-research', 'Quantum Research'],
              ['/settings', 'Settings'],
            ].map(([to, label]) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`rounded-full px-3 py-1 transition-colors ${isActive
                      ? 'bg-primary text-white shadow-soft'
                      : 'text-text-muted hover:bg-slate-100 hover:text-text-main'
                    }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section - Database Stats & Session ID */}
        <div className="flex items-center gap-4 flex-shrink-0 pr-4">
          <DatabaseStats />
          <div className="hidden sm:block">
            <span className="rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-medium text-white shadow-colorful">
              Session: {sessionId ? `${sessionId}` : 'None'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


