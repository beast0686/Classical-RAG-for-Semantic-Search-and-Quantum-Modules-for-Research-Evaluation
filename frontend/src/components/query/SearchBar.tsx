import { FormEvent, useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';

type Props = {
  initialQuery?: string;
  onSubmit: (query: string, k: number) => void;
  loading?: boolean;
};

const SearchBar: React.FC<Props> = ({ initialQuery = '', onSubmit, loading }) => {
  const [query, setQuery] = useState(initialQuery);
  const [k, setK] = useState(10);

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
        <Input
          label="k"
          type="number"
          min={1}
          max={50}
          value={k}
          onChange={(e) => setK(Number(e.target.value) || 10)}
          className="w-20 text-center"
        />
        <Button type="submit" loading={loading}>
          {loading ? 'Running pipeline…' : 'Search'}
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;


