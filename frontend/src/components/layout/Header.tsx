import { Link, useLocation } from 'react-router-dom';
import { useSessionStore } from '../../hooks/useSessionStore';
import DatabaseStats from '../common/DatabaseStats';

const Header: React.FC = () => {
  const location = useLocation();
  const sessionId = useSessionStore((s) => s.sessionId);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-full items-center justify-between px-4 py-3 lg:px-8">
        {/* Left Section - Logo, Branding and Navigation */}
        <div className="flex items-center gap-8 flex-shrink-0">
          {/* Logo and Branding */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-soft">
              <span className="text-lg font-semibold">RAG</span>
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
              ['/settings', 'Settings'],
            ].map(([to, label]) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    isActive
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
        <div className="flex items-center gap-6 flex-shrink-0 pr-4">
          <DatabaseStats />
          <div className="hidden text-xs text-text-muted sm:block">
            <span className="font-medium text-slate-500">Session ID</span>{' '}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700">
              {sessionId ? `${sessionId}` : '—'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


