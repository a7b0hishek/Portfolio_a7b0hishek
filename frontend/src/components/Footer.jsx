import { ArrowUpRight, MoveUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { profile } from '../data/profile.js';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Link className="footer-brand" to="/">{profile.name}<span>.</span></Link>
        <p>Full-stack development with React, Python, and Django.</p>
        <div className="footer-right">
          <Link to="/projects">Explore projects <ArrowUpRight size={14} /></Link>
          <nav className="profile-links" aria-label="Resume-provided profile links">
            {profile.links.map(({ label, href, external }) => (
              <a href={href} key={label} rel={external ? 'noreferrer noopener' : undefined} target={external ? '_blank' : undefined}>
                {label}{external && <ArrowUpRight size={12} aria-hidden="true" />}
              </a>
            ))}
          </nav>
          <span>© {new Date().getFullYear()} Portfolio</span>
        </div>
        <a aria-label="Back to top" className="back-top" href="#top" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}><MoveUpRight size={16} /></a>
      </div>
    </footer>
  );
}
