export const profile = {
  name: 'Abhishek Kr Sharma',
  title: 'Full Stack Developer',
  links: [
    { label: 'LinkedIn', href: 'https://linkedin.com/in/a7b0hishek', external: true },
    { label: 'GitHub', href: 'https://github.com/a7b0hishek', external: true },
    { label: 'Email', href: 'mailto:a7b0hishek@gmail.com', external: false },
  ],
};

export const skillGroups = [
  { label: 'Languages', items: ['JavaScript', 'TypeScript', 'Python', 'SQL', 'C++'] },
  { label: 'Frontend', items: ['React.js', 'HTML5', 'CSS3', 'Tailwind CSS', 'React Router'] },
  { label: 'Backend', items: ['Node.js', 'Express.js', 'Fastify', 'Django', 'Django REST Framework', 'REST APIs'] },
  { label: 'Databases', items: ['MongoDB', 'MySQL', 'PostgreSQL'] },
  { label: 'API & validation', items: ['OpenAPI', 'Zod', 'REST API integration', 'API debugging'] },
  { label: 'Authentication', items: ['JWT', 'OAuth 2.0', 'OTP-based authentication', 'RBAC'] },
  { label: 'Testing & QA', supporting: true, items: ['Manual, functional & regression testing', 'API testing', 'Test case design', 'Bug reporting', 'Postman'] },
  { label: 'Developer tools', items: ['Git', 'GitHub', 'VS Code', 'npm'] },
  { label: 'Deployment', items: ['Render', 'Basic cloud deployment', 'Environment variables'] },
  { label: 'Core concepts', items: ['OOP', 'DBMS', 'Operating systems', 'SDLC', 'STLC', 'Data structures & algorithms'] },
  { label: 'AI', items: ['Claude', 'GPT', 'Groq', 'AI Agents-RAG', 'LLM'] },
];

export const experience = [
  {
    role: 'Python Full Stack Trainee',
    organization: 'Future Finder',
    dates: 'January 2026 – June 2026',
    details: 'Worked with RESTful APIs, authentication, and CRUD operations; contributed to a recommendation engine and prepared API test cases.',
  },
  {
    role: 'Full Stack Developer Intern',
    organization: 'ThinkNext Technologies',
    dates: 'May 2025 – November 2025',
    details: 'Worked on backend modules and REST API integration, optimized SQL queries, used Git, and validated functionality against test plans.',
  },
  {
    role: 'Developer Intern',
    organization: 'Devtown',
    dates: 'August 2024 – March 2025',
    details: 'Worked on Python data cleaning and validation, backend testing workflows, and performance troubleshooting.',
  },
];

export const education = {
  qualification: 'B.Tech in Information Technology',
  institution: 'Chandigarh Engineering College, Landran',
  affiliation: 'IKG Punjab Technical University',
  year: '2026',
  cgpa: '7.6/10',
};
