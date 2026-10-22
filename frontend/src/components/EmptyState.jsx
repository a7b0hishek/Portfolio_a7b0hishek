import { FolderOpen } from 'lucide-react';

export default function EmptyState({ title = 'A little quiet here.', message = 'Projects will appear here once they have been added.' }) {
  return (
    <div className="state-panel empty-state">
      <span className="state-icon"><FolderOpen size={20} /></span>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
