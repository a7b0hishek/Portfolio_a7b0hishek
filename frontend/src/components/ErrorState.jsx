import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message = 'Could not load this content. Please try again.', onRetry }) {
  return (
    <div className="state-panel error-state" role="alert">
      <span className="state-icon"><AlertCircle size={20} /></span>
      <h3>We hit a small snag.</h3>
      <p>{message}</p>
      {onRetry && <button className="text-button" onClick={onRetry} type="button"><RefreshCw size={14} /> Try again</button>}
    </div>
  );
}
