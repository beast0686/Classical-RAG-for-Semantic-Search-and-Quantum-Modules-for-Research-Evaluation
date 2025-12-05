type Props = {
  answer?: string;
  loading?: boolean;
};

const AnswerPanel: React.FC<Props> = ({ answer, loading }) => {
  return (
    <section className="glass-card rounded-2xl border border-slate-100 bg-card/80 p-4 shadow-soft">
      <header className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">MongoDB RAG Answer</h2>
          <p className="mt-1 text-xs text-text-muted">
            Concise answer generated from the retrieved document context.
          </p>
        </div>
      </header>
      <div className="mt-2 min-h-[60px] text-sm leading-relaxed text-text-main">
        {loading ? (
          <div className="space-y-2">
            <div className="h-3 w-11/12 animate-pulse rounded-full bg-slate-100" />
            <div className="h-3 w-10/12 animate-pulse rounded-full bg-slate-100" />
            <div className="h-3 w-7/12 animate-pulse rounded-full bg-slate-100" />
          </div>
        ) : answer ? (
          <p>{answer}</p>
        ) : (
          <p className="text-xs text-text-muted">Run a query to see an answer here.</p>
        )}
      </div>
    </section>
  );
};

export default AnswerPanel;


