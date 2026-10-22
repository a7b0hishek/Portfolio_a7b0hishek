export default function LoadingState({ label = 'Loading projects' }) {
  return <div aria-live="polite" className="state-panel loading-state"><span aria-hidden="true" className="loader-dot" /><span>{label}</span></div>;
}
