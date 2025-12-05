import type { ComparisonMetrics } from '../../api/comparison';

type MetricsTableProps = {
  metrics: ComparisonMetrics;
};

const MetricsTable: React.FC<MetricsTableProps> = ({ metrics }) => {
  const rows = [
    { key: 'plain_llm', label: 'Plain LLM' },
    { key: 'mongodb_rag', label: 'MongoDB RAG' },
    { key: 'neo4j_kg_rag', label: 'Neo4j KG RAG' },
  ] as const;

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 w-fit mx-auto">
      <table className="border-collapse text-left text-xs">
        <thead className="bg-slate-100/80 text-[11px] uppercase tracking-[0.18em] text-slate-500">
          <tr>
            <th className="px-2 py-2 font-semibold w-32">Model</th>
            <th className="px-2 py-2 font-semibold w-20 text-center">BLEU</th>
            <th className="px-2 py-2 font-semibold w-24 text-center">ROUGE-L</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const value = metrics[row.key];
            return (
              <tr key={row.key} className="border-t border-slate-100 text-xs text-text-main">
                <td className="px-2 py-2 font-medium">{row.label}</td>
                <td className="px-2 py-2 font-mono text-[11px] text-center">
                  {value ? value.bleu.toFixed(4) : '—'}
                </td>
                <td className="px-2 py-2 font-mono text-[11px] text-center">
                  {value ? value.rouge_l.toFixed(4) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MetricsTable;


