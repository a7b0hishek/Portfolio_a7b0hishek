import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';
import { skillGroups } from '../data/profile.js';

export default function SkillsSection() {
  return (
    <section className="section skills-section" id="skills">
      <div className="container">
        <SectionHeading eyebrow="Technical skills" title={<>Tools across the<br />full stack.</>} description="Skills and tools listed on my resume, grouped by area." />
        <div className="skills-grid">
          {skillGroups.map(({ label, items, supporting }, index) => (
            <Reveal delay={index * 0.07} key={label}>
              <article className="skill-card">
                <div className="skill-card-top"><span className="skill-number">{String(index + 1).padStart(2, '0')}</span></div>
                <h3>{label}</h3>
                <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
                {supporting && <p className="skill-note">Supporting skills</p>}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
