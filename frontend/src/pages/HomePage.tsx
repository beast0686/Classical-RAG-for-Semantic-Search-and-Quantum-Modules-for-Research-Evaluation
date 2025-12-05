import { useState } from 'react';
import { useQueryApi, type RetrievedDoc, type QueryResponse } from '../api/query';
import { useSessionStore } from '../hooks/useSessionStore';
import SearchBar from '../components/query/SearchBar';
import AnswerPanel from '../components/query/AnswerPanel';
import DocCard from '../components/query/DocCard';
import DocModal from '../components/query/DocModal';
import GraphPanel from '../components/graph/GraphPanel';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';

const HomePage: React.FC = () => {
  const { mutateAsync, isPending, error } = useQueryApi();
  const setSession = useSessionStore((s) => s.setSession);
  const setLastResult = useSessionStore((s) => s.setLastResult);
  const setLastComparison = useSessionStore((s) => s.setLastComparison);
  const lastQuery = useSessionStore((s) => s.lastQuery);
  const lastDocs = useSessionStore((s) => s.lastDocs);
  const lastNodes = useSessionStore((s) => s.lastNodes);
  const lastEdges = useSessionStore((s) => s.lastEdges);
  const lastAnswer = useSessionStore((s) => s.lastAnswer);

  const [selectedDoc, setSelectedDoc] = useState<RetrievedDoc | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = async (query: string, k: number) => {
    const res: QueryResponse = await mutateAsync({ query, k });
    setSession(res.session_id, query);
    setLastResult(res.retrieved_docs, res.nodes, res.edges, res.answer);
    // Clear comparison data when a new session is created
    setLastComparison(null);
  };

  const openDoc = (doc: RetrievedDoc) => {
    setSelectedDoc(doc);
    setModalOpen(true);
  };

  const onSelectDocFromGraph = (docId: string) => {
    const doc = lastDocs.find((d) => d.id === docId);
    if (doc) {
      openDoc(doc);
    }
  };

  const hasDocs = lastDocs.length > 0;

  const baseGraphNodes =
    lastNodes.length > 0
      ? lastNodes
      : hasDocs
        ? lastDocs.map((doc) => ({
            id: `doc_${doc.id}`,
            label: doc.title || '[Doc]',
            group: 'Document',
            score: Number(doc.score) || 0,
          }))
        : [];
  const baseGraphEdges = lastNodes.length > 0 ? lastEdges : [];

  // Add a central DB node and connect all other nodes to it
  const centerId = 'db_center';
  const centerNode =
    baseGraphNodes.length > 0
      ? {
          id: centerId,
          label: 'DB',
          group: 'Center',
          score: 1,
        }
      : null;

  const graphNodes = centerNode ? [centerNode, ...baseGraphNodes] : baseGraphNodes;
  const graphEdges =
    centerNode && baseGraphNodes.length > 0
      ? [
          ...baseGraphEdges,
          ...baseGraphNodes.map((n) => ({
            from: centerId,
            to: n.id,
            relation: n.group === 'Document' ? 'CONTAINS' : 'LINKS',
          })),
        ]
      : baseGraphEdges;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-text-main">Query your RAG pipeline</h2>
          <p className="text-xs text-text-muted">
            Run semantic search, visualize the knowledge graph, and compare answers across models.
          </p>
        </div>
        <SearchBar onSubmit={handleSubmit} initialQuery={lastQuery} loading={isPending} />
      </section>

      {isPending && !hasDocs && (
        <div className="flex items-center gap-3">
          <LoadingSpinner label="Embedding → retrieval → KG extraction → answer…" />
        </div>
      )}

      {error && <ErrorState message={error.message} />}

      <AnswerPanel answer={lastAnswer} loading={isPending && !lastAnswer} />

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-1">
          <header className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Retrieved Documents</h2>
              <p className="mt-1 text-xs text-text-muted">
                Top-k documents from MongoDB Atlas vector search, sorted by similarity.
              </p>
            </div>
          </header>
          {hasDocs ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {lastDocs.map((doc) => (
                <DocCard key={doc.id} doc={doc} onClick={() => openDoc(doc)} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted">Documents will appear here after you run a query.</p>
          )}
        </div>
        <div className="lg:col-span-2">
          <GraphPanel nodes={graphNodes} edges={graphEdges} onSelectDocument={onSelectDocFromGraph} />
        </div>
      </section>

      <DocModal open={modalOpen} doc={selectedDoc} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default HomePage;

