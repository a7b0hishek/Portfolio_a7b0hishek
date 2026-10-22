import { ArrowLeft, ArrowUpRight, Code2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getProjectBySlug } from '../data/projects.js';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const project = getProjectBySlug(slug);

  if (!project) return <section className="page-section"><div className="container"><div className="not-found"><p className="eyebrow"><span className="eyebrow-line" />Project not found</p><h1>This page took<br /><span>a different route.</span></h1><p>That project is not in the local portfolio list.</p><Link className="button button-primary" to="/projects"><ArrowLeft size={15} /> Back to projects</Link></div></div></section>;
  return (
    <article className="page-section detail-page">
      <div className="container detail-container">
        <Link className="back-link" to="/projects"><ArrowLeft size={15} /> All projects</Link>
        <p className="eyebrow"><span className="eyebrow-line" />Project / {project.slug}</p>
        <div className="detail-heading">
          <h1>{project.title}<span>.</span></h1>
          <p>{project.short_description}</p>
        </div>
        <div className="detail-art" aria-hidden="true"><span className="detail-art-mark">{project.title.slice(0, 1).toUpperCase()}</span><span className="detail-art-caption">SELECTED BUILD · {project.tech_stack?.length || 0} TECHNOLOGIES</span></div>
        <div className="detail-columns">
          <section><p className="eyebrow"><span className="eyebrow-line" />Overview</p><div className="detail-description">{project.description.split('\n').filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></section>
          <aside className="detail-sidebar">
            <div><p className="detail-label">Technologies</p><ul className="tag-list detail-tags">{(project.tech_stack || []).map((tech) => <li key={tech}>{tech}</li>)}</ul></div>
            {project.github_url && <div className="detail-links"><p className="detail-label">Project links</p><a href={project.github_url} rel="noopener noreferrer" target="_blank"><Code2 size={16} /> View source <ArrowUpRight size={14} /></a></div>}
          </aside>
        </div>
      </div>
    </article>
  );
}
