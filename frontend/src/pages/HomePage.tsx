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
    <div className="mx-auto flex max-w-full h-[calc(100vh-8rem)] flex-col xl:flex-row gap-6 px-4">
      {/* Left Side - All components except Knowledge Graph */}
      <div className="flex-1 flex flex-col gap-6 xl:pr-8 xl:border-r border-slate-200 px-6">
        {/* Fixed sections at top */}
        <div className="flex-shrink-0 space-y-6">
          <section className="space-y-3">
            <div>
              {/*<h2 className="text-base font-semibold text-text-main">Query your RAG pipeline</h2>*/}
              {/*<p className="text-xs text-text-muted">*/}
              {/*  Run semantic search, visualize the knowledge graph, and compare answers across models.*/}
              {/*</p>*/}
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
        </div>

        {/* Scrollable Retrieved Documents section */}
        <section className="flex-1 min-h-0 flex flex-col space-y-3">
          <header className="flex-shrink-0 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Retrieved Documents</h2>
              <p className="mt-1 text-xs text-text-muted">
                Top-k documents from MongoDB Atlas vector search, sorted by similarity.
              </p>
            </div>
          </header>
          {hasDocs ? (
            <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
              <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
                {lastDocs.map((doc) => (
                  <DocCard key={doc.id} doc={doc} onClick={() => openDoc(doc)} />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-text-muted">Documents will appear here after you run a query.</p>
          )}
        </section>
      </div>

      {/* Right Side - Knowledge Graph */}
      <div className="w-full xl:w-1/2 flex-shrink-0 px-6 min-h-[400px] xl:min-h-0">
        <div className="h-full">
          <GraphPanel nodes={graphNodes} edges={graphEdges} onSelectDocument={onSelectDocFromGraph} />
        </div>
      </div>

      <DocModal open={modalOpen} doc={selectedDoc} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default HomePage;

