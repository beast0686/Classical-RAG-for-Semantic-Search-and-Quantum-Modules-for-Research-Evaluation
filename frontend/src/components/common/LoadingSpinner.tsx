const LoadingSpinner: React.FC<{ label?: string }> = ({ label }) => {
  return (
    <div className="flex items-center gap-3 text-sm text-text-muted">
      <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      {label && <span>{label}</span>}
    </div>
  );
};

export default LoadingSpinner;


