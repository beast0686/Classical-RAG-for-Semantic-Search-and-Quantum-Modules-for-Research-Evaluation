import { useDatabaseStats } from '../../api/database';

const DatabaseStats: React.FC = () => {
  const { data, isLoading, error } = useDatabaseStats();

  if (error) {
    return (
      <div className="hidden text-xs text-text-muted sm:block flex-shrink-0">
        <span className="font-medium text-red-500">DB Error</span>
      </div>
    );
  }

  return (
    <div className="hidden text-xs text-text-muted sm:block flex-shrink-0">
      <span className="font-medium text-slate-500">Total Documents</span>{' '}
      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700">
        {isLoading ? '...' : data?.total_documents?.toLocaleString() ?? '0'}
      </span>
    </div>
  );
};

export default DatabaseStats;
