type ErrorStateProps = {
  message: string;
};

const ErrorState: React.FC<ErrorStateProps> = ({ message }) => {
  return (
    <div className="glass-card border-error/10 bg-error/5 px-4 py-3 text-sm text-error">
      <p className="font-medium">Something went wrong</p>
      <p className="mt-1 text-xs text-error/80">{message}</p>
    </div>
  );
};

export default ErrorState;


