import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, Braces, Code2, Download, Layers3, MoveUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContactForm from '../components/ContactForm.jsx';
import CodingLaunchOrb from '../components/CodingLaunchOrb.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import SkillsSection from '../components/SkillsSection.jsx';
import ResumeSection from '../components/ResumeSection.jsx';
import { RESUME_PDF_FILENAME, RESUME_PDF_URL } from '../data/resume.js';
import { profile } from '../data/profile.js';
import { portfolioProjects } from '../data/projects.js';

export default function HomePage() {
  const reduceMotion = useReducedMotion();
  const featuredProjects = portfolioProjects.filter((project) => project.featured);

  return (
    <>
      <section className="hero-section hero-cyber-section">
        <div className="hero-grid-lines" aria-hidden="true" />
        <div className="container hero-content">
          <motion.div className="hero-copy" initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <p className="eyebrow hero-eyebrow">Full stack developer <span className="hero-eyebrow-line" /></p>
            <h1 className="cyber-headline"><span>Building</span><strong>digital</strong><strong>experiences</strong></h1>
            <p className="hero-tagline">Where ideas meet <em>technology</em><br />and <i>thoughtful execution</i></p>
            <p className="hero-intro text-pretty">I’m {profile.name}, a Full Stack Developer who builds considered web applications with React, Python, and Django.</p>
            <div className="hero-actions">
              <a className="button button-quiet resume-hero-action" download={RESUME_PDF_FILENAME} href={RESUME_PDF_URL}><Download aria-hidden="true" size={15} /> Download Resume</a>
              <Link className="button button-cyber-outline" to="/projects">View all projects <ArrowRight size={15} /></Link>
            </div>
          </motion.div>

          <motion.div className="hero-art hero-character-art" aria-label="Original neon developer illustration" initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduceMotion ? 0 : 0.9, delay: reduceMotion ? 0 : 0.15, ease: 'easeOut' }}>
            <img alt="Original neon developer illustration" className="hero-character" src="/neon-developer-hero.png" />
            <span className="hero-character-caption">Full Stack<br />Developer</span>
          </motion.div>
        </div>
        <a className="scroll-cue" href="#featured"><span>Scroll to explore</span><ArrowDown size={14} /></a>
        <div className="hero-stats container" aria-label="Portfolio highlights">
          <span><Code2 aria-hidden="true" /><b>7</b><small>Projects listed</small></span>
          <span><Layers3 aria-hidden="true" /><b>3</b><small>Internship experiences</small></span>
          <span><Braces aria-hidden="true" /><b>2026</b><small>B.Tech IT graduate</small></span>
          <span><ArrowUpRight aria-hidden="true" /><b>India</b><small>Based in India</small></span>
        </div>
      </section>

      <section className="section featured-section" id="featured">
        <div className="container">
          <SectionHeading eyebrow="Selected work" title="Projects and context." description="A complete local portfolio list. No deployment is required to browse it." />
          <div className="project-grid featured-grid">
            {featuredProjects.map((project, index) => <ProjectCard index={index} key={project.id} project={project} />)}
          </div>
          <div className="section-action"><Link className="text-link" to="/projects">View all projects <ArrowUpRight size={15} /></Link></div>
        </div>
      </section>

      <SkillsSection />

      <ResumeSection />

      <section className="section approach-section" id="about">
        <div className="container approach-layout">
          <Reveal><CodingLaunchOrb /></Reveal>
          <Reveal delay={0.1}>
            <div className="approach-copy">
              <p className="eyebrow"><span className="eyebrow-line" />About my work</p>
              <h2>Building across<br />the full stack.</h2>
              <p>My work spans React interfaces and backend services built with Python, Django, Node.js, and REST APIs. I’m continuing to develop these skills through projects and practical experience.</p>
              <a className="text-link" href="#contact">Start a conversation <ArrowUpRight size={15} /></a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section contact-section" id="contact">
        <div className="container contact-layout">
          <Reveal>
            <div className="contact-intro">
              <p className="eyebrow"><span className="eyebrow-line" />Have something in mind?</p>
              <h2>Let’s make<br /><span>it happen.</span></h2>
              <p>Have a project, a question, or an interesting problem? Send a note and I’ll get back to you.</p>
              <div className="contact-note"><span className="contact-note-icon"><Braces size={17} /></span><span>Every good project<br />starts somewhere.</span><MoveUpRight size={17} /></div>
            </div>
          </Reveal>
          <Reveal delay={0.1}><ContactForm /></Reveal>
        </div>
      </section>
    </>
  );
}
