import ProjectCard from '../components/ProjectCard.jsx';
import Reveal from '../components/Reveal.jsx';
import { portfolioProjects } from '../data/projects.js';

export default function ProjectsPage() {
  return (
    <section className="page-section projects-page">
      <div className="container">
        <Reveal>
          <div className="page-heading">
            <p className="eyebrow"><span className="eyebrow-line" />The archive</p>
            <h1>Selected <span>projects.</span></h1>
            <p className="page-intro">Browse all seven project entries and their technology context. This page works locally without a deployed API.</p>
          </div>
        </Reveal>

        <div aria-live="polite" className="archive-meta">
          <span>{portfolioProjects.length} projects</span>
          <span>Full project list <span className="meta-dot" /> Local portfolio content</span>
        </div>

        <div className="project-grid archive-grid">
          {portfolioProjects.map((project, index) => <ProjectCard index={index} key={project.id} project={project} />)}
        </div>
      </div>
    </section>
  );
}
