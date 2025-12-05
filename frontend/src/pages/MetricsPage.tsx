import { useMemo, useState } from 'react';
import { useMetrics } from '../api/metrics';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';

const MetricsPage: React.FC = () => {
  const { data, isLoading, error } = useMetrics();
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [minRating, setMinRating] = useState(0);

  const filtered = useMemo(() => {
    if (!data?.metrics) return [];
    return data.metrics.filter((entry) => {
      if (modelFilter !== 'all' && entry.model_type !== modelFilter) return false;
      const ratings = entry.human_ratings;
      if (!ratings || !minRating) return true;
      const vals = Object.values(ratings).filter((n): n is number => typeof n === 'number');
      if (!vals.length) return false;
      const avg = vals.reduce((acc, v) => acc + v, 0) / vals.length;
      return avg >= minRating;
    });
  }, [data, modelFilter, minRating]);

  const handleExport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data.metrics, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'metrics.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <section className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text-main">Metrics & feedback</h2>
          <p className="text-xs text-text-muted">
            Inspect historical human ratings and automated metrics across sessions.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={handleExport} disabled={!data?.metrics?.length}>
          Export JSON
        </Button>
      </section>

      <section className="glass-card flex flex-col gap-3 rounded-2xl border border-slate-100 bg-card/80 p-4 shadow-soft">
        <div className="flex flex-wrap items-end gap-3 text-xs">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Model</p>
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="mt-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-text-main"
            >
              <option value="all">All models</option>
              <option value="plain_llm">Plain LLM</option>
              <option value="mongodb_rag">MongoDB RAG</option>
              <option value="neo4j_kg_rag">Neo4j KG RAG</option>
            </select>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Min rating</p>
            <input
              type="number"
              min={0}
              max={5}
              step={0.5}
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value) || 0)}
              className="mt-1 w-20 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-text-main"
            />
          </div>
          {data && (
            <p className="ml-auto text-[11px] text-text-muted">
              Showing {filtered.length} of {data.total_entries} entries
            </p>
          )}
        </div>

        {isLoading && <LoadingSpinner label="Loading metrics…" />}
        {error && <ErrorState message={error.message} />}

        {!isLoading && !error && (
          <div className="max-h-[420px] overflow-auto rounded-2xl border border-slate-100">
            <table className="min-w-full border-collapse text-left text-xs">
              <thead className="bg-slate-100/80 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-semibold">Session</th>
                  <th className="px-3 py-2 font-semibold">Model</th>
                  <th className="px-3 py-2 font-semibold">Human ratings (avg)</th>
                  <th className="px-3 py-2 font-semibold">Automated metrics</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => {
                  const r = entry.human_ratings;
                  const automated = entry.calculated_metrics;
                  let avgHuman = '—';
                  if (r) {
                    const vals = Object.values(r).filter((n): n is number => typeof n === 'number');
                    if (vals.length) {
                      avgHuman = (vals.reduce((acc, v) => acc + v, 0) / vals.length).toFixed(2);
                    }
                  }
                  const autoSummary = automated
                    ? Object.entries(automated)
                        .map(([name, v]) => `${name}: BLEU ${v.bleu.toFixed(2)}, ROUGE-L ${v.rouge_l.toFixed(2)}`)
                        .join(' · ')
                    : '—';
                  return (
                    <tr key={entry.session_id + entry.model_type} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-mono text-[11px]">
                        {entry.session_id.slice(0, 8)}…
                      </td>
                      <td className="px-3 py-2">{entry.model_type}</td>
                      <td className="px-3 py-2">{avgHuman}</td>
                      <td className="px-3 py-2 text-[11px] text-text-muted">{autoSummary}</td>
                    </tr>
                  );
                })}
                {!filtered.length && (
                  <tr>
                    <td className="px-3 py-4 text-center text-xs text-text-muted" colSpan={4}>
                      No metrics match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default MetricsPage;


