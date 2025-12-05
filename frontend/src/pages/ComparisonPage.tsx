import { useState } from 'react';
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
  const { mutateAsync, data, isPending, error } = useGenerateComparison();
  const feedbackMutation = useSubmitFeedback();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleRunComparison = async () => {
    if (!sessionId) return;
    await mutateAsync({ session_id: sessionId });
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
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <section className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text-main">Model comparison</h2>
          <p className="text-xs text-text-muted">
            Generate answers from three approaches and compare them with automated metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[11px] text-text-muted">
            <span className="mr-1 font-medium text-slate-500">Session</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700">
              {sessionId ? `${sessionId.slice(0, 8)}…` : 'None'}
            </span>
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

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-xs text-text-muted">
              Provide human ratings to log subjective quality alongside automated scores.
            </div>
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
                <p className="mt-1 text-xs text-text-muted">
                  Feedback is stored per-session and per-model for research evaluation.
                </p>
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


