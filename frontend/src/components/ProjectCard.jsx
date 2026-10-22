import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Code2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const palettes = ['mint', 'violet', 'orange', 'blue'];

export default function ProjectCard({ project, index = 0 }) {
  const palette = palettes[index % palettes.length];
  const previewImage = project.image_url || (project.slug === 'movie-x' ? '/movie-x-preview.jpeg' : '');
  return (
    <motion.article className={`project-card ${palette}`} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Link className="project-card-main" to={`/projects/${encodeURIComponent(project.slug)}`}>
        <div className={`project-card-visual${previewImage ? ' has-preview' : ''}`}>
          {previewImage && <img className="project-card-preview" src={previewImage} alt={`${project.title} project preview`} />}
          <span className="visual-index" aria-hidden="true">PROJECT / {String(index + 1).padStart(2, '0')}</span>
          {!previewImage && <div className="visual-art" aria-hidden="true"><span /><span /><span /></div>}
          {project.featured && <span className="featured-chip">Featured</span>}
          <span className="card-arrow" aria-hidden="true"><ArrowDownRight size={20} /></span>
        </div>
        <div className="project-card-copy">
          <div className="project-title-row">
            <h3>{project.title}</h3>
            <ArrowUpRight className="project-title-arrow" size={19} aria-hidden="true" />
          </div>
          <p>{project.short_description}</p>
          <ul aria-label="Technologies" className="tag-list">
            {(project.tech_stack || []).slice(0, 5).map((tech) => <li key={tech}>{tech}</li>)}
          </ul>
        </div>
      </Link>
      {(project.github_url || project.live_url) && (
        <div className="project-card-links">
          {project.github_url && <a href={project.github_url} rel="noopener noreferrer" target="_blank"><Code2 aria-hidden="true" size={15} /> GitHub</a>}
          {project.live_url && <a href={project.live_url} rel="noopener noreferrer" target="_blank">Live Demo <ExternalLink aria-hidden="true" size={14} /></a>}
        </div>
      )}
    </motion.article>
  );
}
