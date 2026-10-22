import { ArrowUpRight, Download } from 'lucide-react';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';
import { education, experience } from '../data/profile.js';
import { RESUME_PDF_FILENAME, RESUME_PDF_URL } from '../data/resume.js';

export default function ResumeSection() {
  return (
    <section className="section resume-section" id="experience" aria-labelledby="resume-heading">
      <div className="container">
        <Reveal>
          <div className="resume-download-panel" id="resume">
            <div>
              <p className="eyebrow"><span className="eyebrow-line" />Resume PDF</p>
              <h2 id="resume-heading">A little more about my background.</h2>
              <p className="resume-download-description">Download my resume for an overview of my experience, education, and skills.</p>
            </div>
            <div className="resume-download-actions">
              <a className="button button-primary" download={RESUME_PDF_FILENAME} href={RESUME_PDF_URL}><Download aria-hidden="true" size={15} /> Download Resume</a>
              <a className="text-link" href={RESUME_PDF_URL} rel="noopener noreferrer" target="_blank">View Resume <ArrowUpRight aria-hidden="true" size={15} /></a>
            </div>
          </div>
        </Reveal>
        <SectionHeading
          eyebrow="Experience & education"
          title={<>Learning through<br />building and practice.</>}
          description="Internship, trainee, and education details from my resume."
          id="experience-heading"
        />
        <div className="resume-layout">
          <div className="experience-list" role="list" aria-label="Work experience">
            {experience.map((item, index) => (
              <Reveal key={`${item.organization}-${item.role}`} delay={index * 0.08}>
                <article className="experience-item" role="listitem">
                  <span className="experience-index" aria-hidden="true">0{index + 1}</span>
                  <div>
                    <p className="eyebrow">{item.dates}</p>
                    <h3>{item.role}</h3>
                    <p className="experience-organization">{item.organization}</p>
                    <p className="experience-details">{item.details}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.12}>
            <article className="education-card">
              <p className="eyebrow"><span className="eyebrow-line" />Education</p>
              <h3>{education.qualification}</h3>
              <p className="education-institution">{education.institution}</p>
              <p className="experience-details">{education.affiliation}</p>
              <div className="education-meta">
                <span>{education.year}</span>
                <span>CGPA {education.cgpa}</span>
              </div>
              <a className="text-link" href="#contact">Get in touch <ArrowUpRight size={15} /></a>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
