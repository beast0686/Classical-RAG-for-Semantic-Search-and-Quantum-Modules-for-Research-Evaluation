import type { RetrievedDoc } from '../../api/query';

type Props = {
  doc: RetrievedDoc;
  onClick: () => void;
};

const DocCard: React.FC<Props> = ({ doc, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-card flex h-full flex-col rounded-2xl border border-slate-100 bg-card/80 p-4 text-left shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="line-clamp-1 text-sm font-semibold text-text-main">{doc.title || '[No title]'}</h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-600">
          {Number(doc.score).toFixed(4)}
        </span>
      </div>
      <p className="mb-3 line-clamp-3 text-xs text-text-muted">{doc.summary || '[No summary provided]'}</p>
      {doc.keywords && (
        <div className="mt-auto flex flex-wrap gap-1">
          {doc.keywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean)
            .map((kw) => (
              <span
                key={kw}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
              >
                {kw}
              </span>
            ))}
        </div>
      )}
    </button>
  );
};

export default DocCard;


