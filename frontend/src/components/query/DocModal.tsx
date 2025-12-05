import type { RetrievedDoc } from '../../api/query';
import Button from '../common/Button';

type Props = {
  open: boolean;
  doc: RetrievedDoc | null;
  onClose: () => void;
};

const DocModal: React.FC<Props> = ({ open, doc, onClose }) => {
  if (!open || !doc) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-overlay">
      <div className="glass-card max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-card p-5 shadow-soft">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-text-main">{doc.title || '[No title]'}</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-600">
            score {Number(doc.score).toFixed(4)}
          </span>
        </div>
        <div className="mb-3 max-h-60 overflow-y-auto text-sm text-text-muted">
          <p>{doc.summary || '[No summary provided]'}</p>
        </div>
        <div className="mb-4 flex flex-wrap gap-1">
          {doc.keywords &&
            doc.keywords
              .split(',')
              .map((k) => k.trim())
              .filter(Boolean)
              .map((kw) => (
                <span key={kw} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                  {kw}
                </span>
              ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] text-text-muted">ID: {doc.id}</div>
          <div className="flex gap-2">
            {doc.url && (
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800"
              >
                Open source
              </a>
            )}
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocModal;


