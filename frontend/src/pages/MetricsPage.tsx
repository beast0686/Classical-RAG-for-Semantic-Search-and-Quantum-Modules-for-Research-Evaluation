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
    <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-6">
      <section className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-bright-blue/30 bg-gradient-to-br from-bright-blue/5 to-bright-blue/10 shadow-colorful">
        <div>
          <h2 className="text-base font-semibold bg-gradient-to-r from-bright-blue to-primary bg-clip-text text-transparent">Metrics & Feedback</h2>
        </div>
        <Button
          type="button"
          onClick={handleExport}
          disabled={!data?.metrics?.length}
          className="whitespace-nowrap"
        >
          Export JSON
        </Button>
      </section>

      <section className="glass-card flex flex-col gap-4 rounded-2xl border border-bright-purple/30 bg-gradient-to-br from-bright-purple/5 to-bright-purple/10 p-5 shadow-colorful">
        <div className="flex flex-wrap items-end gap-4 text-xs">
          <div className="p-3 rounded-lg border border-bright-blue/20 bg-gradient-to-br from-bright-blue/5 to-bright-blue/10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] bg-gradient-to-r from-bright-blue to-primary bg-clip-text text-transparent mb-2">Model Filter</p>
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="rounded-full border border-bright-blue/30 bg-gradient-to-br from-bright-blue/5 to-bright-blue/10
                   px-3 py-2 text-xs text-text-main shadow-colorful outline-none transition-all
                   focus:border-bright-blue focus:ring-2 focus:ring-bright-blue/20"
            >
              <option value="all">All models</option>
              <option value="plain_llm">Plain LLM</option>
              <option value="mongodb_rag">MongoDB RAG</option>
              <option value="neo4j_kg_rag">Neo4j KG RAG</option>
            </select>
          </div>

          <div className="p-3 rounded-lg border border-bright-orange/20 bg-gradient-to-br from-bright-orange/5 to-bright-pink/10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] bg-gradient-to-r from-bright-orange to-bright-pink bg-clip-text text-transparent mb-4">Minimum Rating</p>
            <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={
                      star === 0
                        ? `px-2 py-1 text-xs rounded-full ${
                            minRating === 0
                              ? 'bg-yellow-400 text-white shadow-sm'   // All selected → yellow highlight
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`
                        : star <= minRating
                        ? 'text-yellow-400 hover:text-yellow-500'
                        : 'text-gray-300 hover:text-gray-400'
                    }
                    onClick={() => setMinRating(star)}
                    title={star === 0 ? 'No minimum rating' : `${star} star minimum`}
                  >
                    {star === 0 ? 'All' : '★'}
                  </button>
                ))}
              <span className="ml-2 text-xs text-text-muted">
                {minRating === 0 ? 'No filter' : `${minRating}+ stars`}
              </span>
            </div>
          </div>

          {data && (
            <div className="ml-auto p-2 rounded-full bg-gradient-to-r from-bright-green to-secondary text-white shadow-sm">
              <p className="text-xs font-medium px-2">
                {filtered.length} of {data.total_entries} entries
              </p>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="p-4 rounded-2xl border border-bright-indigo/30 bg-gradient-to-br from-bright-indigo/5 to-bright-indigo/10">
            <LoadingSpinner label="Loading metrics…" />
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl border border-error/30 bg-gradient-to-br from-error/5 to-error/10">
            <ErrorState message={error.message} />
          </div>
        )}

        {!isLoading && !error && (
          <div className="max-h-[420px] overflow-auto rounded-2xl border border-medium-gray/40 bg-gradient-to-br from-white to-light-gray shadow-colorful">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="border-b border-medium-gray/30">
                <tr>
                  <th className="px-4 py-3 font-semibold bg-gradient-to-r from-bright-purple to-accent bg-clip-text text-transparent uppercase tracking-[0.18em] text-xs">Session ID</th>
                  <th className="px-4 py-3 font-semibold bg-gradient-to-r from-bright-blue to-primary bg-clip-text text-transparent uppercase tracking-[0.18em] text-xs">Model Type</th>
                  <th className="px-4 py-3 font-semibold bg-gradient-to-r from-bright-orange to-bright-pink bg-clip-text text-transparent uppercase tracking-[0.18em] text-xs">Human Ratings</th>
                  <th className="px-4 py-3 font-semibold bg-gradient-to-r from-bright-green to-secondary bg-clip-text text-transparent uppercase tracking-[0.18em] text-xs">Automated Metrics</th>
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
                  // Get metrics for the specific model type only
                  const modelMetrics = automated?.[entry.model_type];

                  // Model-specific row coloring
                  const rowColorClass = entry.model_type === 'plain_llm'
                    ? 'bg-gradient-to-r from-bright-blue/5 to-bright-blue/10 border-bright-blue/20'
                    : entry.model_type === 'mongodb_rag'
                    ? 'bg-gradient-to-r from-bright-green/5 to-bright-green/10 border-bright-green/20'
                    : 'bg-gradient-to-r from-bright-purple/5 to-bright-purple/10 border-bright-purple/20';

                  return (
                    <tr key={entry.session_id + entry.model_type} className={`border-t ${rowColorClass} text-sm`}>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-gradient-to-r from-medium-gray to-slate-400 px-2 py-1 text-xs font-mono text-white shadow-sm">
                          {entry.session_id.slice(0, 8)}…
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${
                          entry.model_type === 'plain_llm'
                            ? 'bg-gradient-to-r from-bright-blue to-primary bg-clip-text text-transparent'
                            : entry.model_type === 'mongodb_rag'
                            ? 'bg-gradient-to-r from-bright-green to-secondary bg-clip-text text-transparent'
                            : 'bg-gradient-to-r from-bright-purple to-accent bg-clip-text text-transparent'
                        }`}>
                          {entry.model_type === 'plain_llm' ? 'Plain LLM'
                           : entry.model_type === 'mongodb_rag' ? 'MongoDB RAG'
                           : 'Neo4j KG RAG'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {avgHuman !== '—' ? (
                          <span className="rounded-full bg-gradient-to-r from-bright-orange to-bright-pink px-2 py-1 text-xs font-mono text-white shadow-sm">
                            {avgHuman}/5
                          </span>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {modelMetrics ? (
                          <div className="flex gap-2">
                            <span className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-2 py-1 text-xs font-mono text-white shadow-sm">
                              BLEU {modelMetrics.bleu.toFixed(4)}
                            </span>
                            <span className="rounded-full bg-gradient-to-r from-red-500 to-red-600 px-2 py-1 text-xs font-mono text-white shadow-sm">
                              ROUGE-L {modelMetrics.rouge_l.toFixed(4)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-text-muted text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!filtered.length && (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-text-muted bg-gradient-to-r from-light-gray/50 to-white/50" colSpan={4}>
                      <div className="flex flex-col items-center gap-2">
                        <span>No metrics match the current filters.</span>
                      </div>
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


