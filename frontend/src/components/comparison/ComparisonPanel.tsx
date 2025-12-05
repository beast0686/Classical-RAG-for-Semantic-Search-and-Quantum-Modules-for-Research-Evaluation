import { useState } from 'react';
import type { ComparisonResponse } from '../../api/comparison';
import Button from '../common/Button';

type Props = {
  data: ComparisonResponse;
};

type ColumnKey = 'plain_llm' | 'mongodb_rag' | 'neo4j_kg_rag';

const labelMap: Record<ColumnKey, string> = {
  plain_llm: 'Plain LLM',
  mongodb_rag: 'MongoDB RAG',
  neo4j_kg_rag: 'Neo4j KG RAG',
};

const ComparisonPanel: React.FC<Props> = ({ data }) => {
  const [expanded, setExpanded] = useState<Record<ColumnKey, boolean>>({
    plain_llm: false,
    mongodb_rag: false,
    neo4j_kg_rag: false,
  });

  const handleCopy = async (text: string) => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(text);
  };

  const rows: { key: ColumnKey; answer: string }[] = [
    { key: 'plain_llm', answer: data.plain_llm_answer },
    { key: 'mongodb_rag', answer: data.mongodb_rag_answer },
    { key: 'neo4j_kg_rag', answer: data.neo4j_kg_rag_answer },
  ];

  return (
    <section className="glass-card rounded-2xl border border-slate-100 bg-card/80 p-4 shadow-soft">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Model Comparison
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            Compare the baseline plain LLM, MongoDB RAG, and Neo4j KG RAG answers.
          </p>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {rows.map((row) => {
          const metric = data.calculated_metrics[row.key];
          const isExpanded = expanded[row.key];
          const answer = row.answer ?? '';
          const shortAnswer =
            answer && !isExpanded && answer.length > 260 ? `${answer.slice(0, 260)}…` : answer;

          return (
            <div
              key={row.key}
              className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-sm"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-text-main">{labelMap[row.key]}</p>
                  <div className="mt-1 flex gap-1 text-[11px] text-text-muted">
                    <span className="rounded-full bg-white px-2 py-0.5 font-mono">
                      BLEU {metric?.bleu.toFixed(4) ?? '—'}
                    </span>
                    <span className="rounded-full bg-white px-2 py-0.5 font-mono">
                      ROUGE-L {metric?.rouge_l.toFixed(4) ?? '—'}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="px-2 py-1 text-[11px]"
                  onClick={() => handleCopy(answer)}
                  disabled={!answer}
                >
                  Copy
                </Button>
              </div>
              <div className="flex-1 text-xs text-text-main">
                {answer ? (
                  <p>{shortAnswer}</p>
                ) : (
                  <p className="text-text-muted">No answer available.</p>
                )}
              </div>
              {answer && answer.length > 260 && (
                <button
                  type="button"
                  className="mt-2 self-start text-[11px] font-medium text-primary hover:text-primary-hover"
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [row.key]: !prev[row.key],
                    }))
                  }
                >
                  {isExpanded ? 'Collapse' : 'Expand'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ComparisonPanel;


