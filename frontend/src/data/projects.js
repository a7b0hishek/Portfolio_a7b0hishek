export const portfolioProjects = [
  {
    id: 'flock-energy-meter-transformer-platform',
    title: 'Flock Energy Meter & Transformer Platform',
    slug: 'flock-energy-meter-transformer-platform',
    short_description: 'A take-home engineering assignment with meter and transformer dashboards, search, detail views, and CSV export.',
    description: 'A take-home engineering assignment for meter and transformer management. The supplied project details describe dashboards with search and filtering, detail views, authenticated CSV exports, a responsive interface, and light and dark themes. The project uses fixture-backed data by default, so this entry does not claim that live portal data is retrieved or that portal integration is complete.',
    tech_stack: ['React', 'TypeScript', 'Vite', 'Fastify', 'Node.js', 'Zod', 'REST APIs'],
    github_url: 'https://github.com/a7b0hishek/flock-energy',
    live_url: 'https://flock-energy-frontend.onrender.com/login',
    image_url: '',
    featured: true,
  },
  {
    id: 'ai-powered-task-management-rest-api',
    title: 'AI-Powered Task Management REST API',
    slug: 'ai-powered-task-management-rest-api',
    short_description: 'A task management REST API with authenticated workflows, role-based access, and an LLM assistant.',
    description: 'A task management REST API with authenticated workflows, role-based access, and an LLM assistant.',
    tech_stack: ['Python', 'Django REST Framework', 'PostgreSQL'],
    github_url: 'https://github.com/a7b0hishek/AI-Task-Manager',
    live_url: 'https://ai-task-manager-3bd5.onrender.com/',
    image_url: '', featured: true,
  },
  {
    id: 'price-comparison-web-app', title: 'Price Comparison Web App', slug: 'price-comparison-web-app',
    short_description: 'A product comparison app with search, category filters, INR pricing, and retailer links.',
    description: 'A React and Express web application supporting product search, category filtering, INR pricing, price comparison, responsive product grids, and retailer links. The supplied details do not establish that pricing is real time across every retailer.',
    tech_stack: ['React', 'Node.js', 'Express', 'Tailwind CSS', 'Framer Motion', 'React Router', 'Axios'],
    github_url: 'https://github.com/a7b0hishek/PriceHunter', live_url: 'https://pricehunter-1.onrender.com/', image_url: '', featured: false,
  },
  {
    id: 'shoply-clone', title: 'Shoply Clone', slug: 'shoply-clone',
    short_description: 'An e-commerce application with authentication, product listings, cart, wishlist, and order management.',
    description: 'An e-commerce clone with authentication, product listings, a shopping cart, wishlist, order management, and Stripe integration. Production payment readiness has not been established.',
    tech_stack: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT', 'Stripe'],
    github_url: 'https://github.com/a7b0hishek/Shoply-Clon', live_url: '', image_url: '', featured: false,
  },
  {
    id: 'note-taking-app', title: 'Note-Taking App', slug: 'note-taking-app',
    short_description: 'A full-stack note-taking app with authentication, protected routes, and note management.',
    description: 'A full-stack note-taking application providing authentication, protected routes, note create, read, update, and delete operations, a responsive interface, and theme support.',
    tech_stack: ['React', 'Redux Toolkit', 'Node.js', 'Express', 'MongoDB', 'JWT', 'bcryptjs'],
    github_url: 'https://github.com/a7b0hishek/Note_takingApp', live_url: 'https://note-takingapp.onrender.com/', image_url: '', featured: false,
  },
  {
    id: 'point-and-shoot-canvas-game', title: 'Point and Shoot — Canvas Game', slug: 'point-and-shoot-canvas-game',
    short_description: 'A browser game where players click flying ravens to score and avoid a game over.',
    description: 'A browser game built with HTML5 Canvas, JavaScript, and CSS. Players click flying ravens to score, with collision detection, animated backgrounds, sound and visual effects, and a game-over state.',
    tech_stack: ['HTML5 Canvas', 'JavaScript', 'CSS'],
    github_url: 'https://github.com/a7b0hishek/Fun-game-Point-Shoot-', live_url: 'https://fun-game-point-shoot.vercel.app/', image_url: '', featured: false,
  },
  {
    id: 'movie-x', title: 'Movie-X', slug: 'movie-x',
    short_description: 'A responsive TMDB-powered movie and TV discovery app for search, browsing, and details.',
    description: 'Movie-X is a responsive movie discovery application built with React.js and the TMDB API. Visitors can search movies and TV shows, browse Trending, Popular, and Top Rated content, and explore category pages. Detail pages present cast, crew, ratings, and related recommendations. Images are lazy-loaded.',
    tech_stack: ['React.js', 'Redux Toolkit', 'React Router', 'TMDB API', 'SCSS', 'JavaScript'],
    github_url: 'https://github.com/a7b0hishek/Movie-X', live_url: 'https://movie-x-orcin.vercel.app/', image_url: '', featured: true,
  },
];

export function getProjectBySlug(slug) {
  return portfolioProjects.find((project) => project.slug === slug);
}
