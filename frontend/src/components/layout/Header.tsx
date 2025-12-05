import { Link, useLocation } from 'react-router-dom';
import { useSessionStore } from '../../hooks/useSessionStore';

const Header: React.FC = () => {
  const location = useLocation();
  const sessionId = useSessionStore((s) => s.sessionId);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-soft">
            <span className="text-lg font-semibold">R</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-text-main sm:text-base">
              RAG Knowledge Graph Studio
            </h1>
            <p className="text-xs text-text-muted">Explore, compare, and evaluate your RAG pipeline.</p>
          </div>
        </div>
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
        <div className="ml-4 hidden text-xs text-text-muted sm:block">
          <span className="font-medium text-slate-500">Session</span>{' '}
          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700">
            {sessionId ? `${sessionId.slice(0, 8)}…` : '—'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;


