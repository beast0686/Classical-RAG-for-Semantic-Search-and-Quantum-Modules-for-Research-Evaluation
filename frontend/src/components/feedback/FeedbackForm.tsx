import { FormEvent, useState } from 'react';
import type { ModelType, FeedbackRatings } from '../../api/feedback';
import Button from '../common/Button';

type ModelConfig = {
  model_type: ModelType;
  label: string;
};

const MODELS: ModelConfig[] = [
  { model_type: 'plain_llm', label: 'Plain LLM' },
  { model_type: 'mongodb_rag', label: 'MongoDB RAG' },
  { model_type: 'neo4j_kg_rag', label: 'Neo4j KG RAG' },
];

type Props = {
  onSubmit: (values: { model_type: ModelType; ratings: FeedbackRatings }[]) => Promise<void> | void;
  submitting?: boolean;
};

const SLIDERS: (keyof FeedbackRatings)[] = ['accuracy', 'completeness', 'coherence', 'helpfulness'];

const FeedbackForm: React.FC<Props> = ({ onSubmit, submitting }) => {
  const [values, setValues] = useState<Record<ModelType, FeedbackRatings>>({
    plain_llm: { accuracy: 3, completeness: 3, coherence: 3, helpfulness: 3 },
    mongodb_rag: { accuracy: 3, completeness: 3, coherence: 3, helpfulness: 3 },
    neo4j_kg_rag: { accuracy: 3, completeness: 3, coherence: 3, helpfulness: 3 },
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (model: ModelType, key: keyof FeedbackRatings, val: number) => {
    setValues((prev) => ({
      ...prev,
      [model]: {
        ...prev[model],
        [key]: val,
      },
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Every slider is 1-5
    for (const model of MODELS) {
      const v = values[model.model_type];
      if (!v) {
        setError('Please rate all models.');
        return;
      }
      const keys: (keyof FeedbackRatings)[] = ['accuracy', 'completeness', 'coherence', 'helpfulness'];
      for (const key of keys) {
        const num = v[key];
        if (!num || num < 1 || num > 5) {
          setError('Ratings must be between 1 and 5 for each model.');
          return;
        }
      }
    }

    await onSubmit(
      MODELS.map((m) => ({
        model_type: m.model_type,
        ratings: values[m.model_type],
      })),
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-text-muted">
        Rate each answer on a 1–5 scale. These ratings will be stored alongside automated metrics for analysis.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {MODELS.map((model) => (
          <div key={model.model_type} className="rounded-2xl bg-slate-50/90 p-3 text-xs">
            <p className="mb-2 text-[11px] font-semibold tracking-[0.18em] text-slate-500">
              {model.label.toUpperCase()}
            </p>
            <div className="space-y-2">
              {SLIDERS.map((key) => (
                <div key={key}>
                  <div className="flex items-center justify-between text-[11px] text-text-muted">
                    <span className="capitalize">{key}</span>
                    <span className="font-mono">{values[model.model_type][key]}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={values[model.model_type][key]}
                    onChange={(e) => handleChange(model.model_type, key, Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" loading={submitting}>
          Submit feedback
        </Button>
      </div>
    </form>
  );
};

export default FeedbackForm;


