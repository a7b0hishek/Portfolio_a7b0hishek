import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectsPage from './ProjectsPage.jsx';

describe('ProjectsPage', () => {
  it('shows the complete local project list with descriptions', () => {
    render(<MemoryRouter><ProjectsPage /></MemoryRouter>);

    expect(screen.getByText('7 projects')).toBeInTheDocument();
    expect(screen.getByText(/Full project list/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Flock Energy Meter & Transformer Platform' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Movie-X' })).toBeInTheDocument();
    expect(screen.getByText(/CSV export/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Movie-X/ })).toHaveAttribute('href', '/projects/movie-x');
  });

  it('shows supplied source and live deployment links', () => {
    render(<MemoryRouter><ProjectsPage /></MemoryRouter>);

    expect(screen.getAllByRole('link', { name: /GitHub/ })).toHaveLength(7);
    const liveDemoLinks = screen.getAllByRole('link', { name: /live demo/i });
    expect(liveDemoLinks).toHaveLength(6);
    const liveDemoLink = liveDemoLinks.find((link) => link.getAttribute('href') === 'https://ai-task-manager-3bd5.onrender.com/');
    expect(liveDemoLink).toBeDefined();
    expect(liveDemoLink).toHaveAttribute('href', 'https://ai-task-manager-3bd5.onrender.com/');
    expect(liveDemoLink).toHaveAttribute('target', '_blank');
    expect(liveDemoLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
