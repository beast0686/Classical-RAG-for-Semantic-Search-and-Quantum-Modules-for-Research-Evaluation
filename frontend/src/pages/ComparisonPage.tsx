import { useState, useEffect } from 'react';
import { useGenerateComparison } from '../api/comparison';
import { useSubmitFeedback } from '../api/feedback';
import { useSessionStore } from '../hooks/useSessionStore';
import Button from '../components/common/Button';
import ErrorState from '../components/common/ErrorState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ComparisonPanel from '../components/comparison/ComparisonPanel';
import MetricsTable from '../components/comparison/MetricsTable';
import FeedbackForm from '../components/feedback/FeedbackForm';

const ComparisonPage: React.FC = () => {
  const sessionId = useSessionStore((s) => s.sessionId);
  const lastComparison = useSessionStore((s) => s.lastComparison);
  const setLastComparison = useSessionStore((s) => s.setLastComparison);
  const { mutateAsync, data: newData, isPending, error } = useGenerateComparison();
  const feedbackMutation = useSubmitFeedback();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Use cached data if available, otherwise use new data
  const data = newData || lastComparison;

  // Save comparison data to session store when new data is received
  useEffect(() => {
    if (newData) {
      setLastComparison(newData);
    }
  }, [newData, setLastComparison]);

  const handleRunComparison = async () => {
    if (!sessionId) return;
    const result = await mutateAsync({ session_id: sessionId });
    setLastComparison(result);
  };

  const handleSubmitFeedback = async (entries: Parameters<typeof FeedbackForm>[0]['onSubmit'] extends (
    arg: infer T,
  ) => any
    ? T
    : never) => {
    if (!sessionId) return;
    await feedbackMutation.mutateAsync({
      session_id: sessionId,
      feedbacks: entries,
    });
    setFeedbackSubmitted(true);
  };

  return (
      <div className="flex flex-col min-h-screen w-full gap-5 px-12 py-6 bg-background">
      <section className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text-main">Model comparison</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[11px] text-text-muted">
          </div>
          <Button
            type="button"
            onClick={handleRunComparison}
            disabled={!sessionId}
            loading={isPending}
            className="whitespace-nowrap"
          >
            Generate comparison
          </Button>
        </div>
      </section>

      {!sessionId && (
        <p className="text-xs text-warning">
          Run a query on the Home page first to create a session, then return here.
        </p>
      )}

      {isPending && <LoadingSpinner label="Generating answers and computing metrics…" />}
      {error && <ErrorState message={error.message} />}

      {data && (
        <>
          <ComparisonPanel data={data} />
          <MetricsTable metrics={data.calculated_metrics} />

          <div className="mt-4 flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFeedbackOpen(true)}
              disabled={feedbackSubmitted}
            >
              {feedbackSubmitted ? 'Thank you for your feedback' : 'Rate answers'}
            </Button>
          </div>
        </>
      )}

      {feedbackOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-overlay">
          <div className="glass-card w-full max-w-3xl rounded-2xl border border-slate-100 bg-card p-5 shadow-soft">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Rate Answers
                </h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="px-2 py-1 text-[11px]"
                onClick={() => setFeedbackOpen(false)}
              >
                Close
              </Button>
            </div>
            <FeedbackForm onSubmit={handleSubmitFeedback} submitting={feedbackMutation.isPending} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonPage;
