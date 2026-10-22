import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <section className="page-section"><div className="container not-found"><p className="eyebrow"><span className="eyebrow-line" />404 — Not found</p><h1>Looks like this<br /><span>page wandered.</span></h1><p>The page you’re looking for doesn’t exist or may have moved.</p><Link className="button button-primary" to="/"><ArrowLeft size={15} /> Go home</Link></div></section>;
}
