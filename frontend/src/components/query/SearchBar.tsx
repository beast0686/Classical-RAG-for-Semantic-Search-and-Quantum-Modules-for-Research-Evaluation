import { useState, type FormEvent } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';

type Props = {
  initialQuery?: string;
  onSubmit: (query: string, k: number) => void;
  loading?: boolean;
};

const SearchBar: React.FC<Props> = ({ initialQuery = '', onSubmit, loading }) => {
  const [query, setQuery] = useState(initialQuery);
  const [k, setK] = useState(5);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    onSubmit(trimmed, k);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card flex flex-col gap-3 rounded-2xl border border-slate-100 bg-card/80 px-4 py-4 shadow-soft sm:flex-row sm:items-center sm:gap-4"
    >
      <div className="flex-1">
        <Input
          label="Query"
          placeholder="Ask about your corpus, e.g. “How does the RAG pipeline construct the knowledge graph?”"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-text-main">
            Documents (k = {k})
          </label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted">2</span>
            <input
              type="range"
              min="2"
              max="20"
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              className="w-24 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((k-2)/(20-2))*100}%, #e2e8f0 ${((k-2)/(20-2))*100}%, #e2e8f0 100%)`
              }}
            />
            <span className="text-xs text-text-muted">20</span>
          </div>
        </div>
        <Button type="submit" loading={loading}>
          {loading ? 'Running pipeline…' : 'Search'}
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;


