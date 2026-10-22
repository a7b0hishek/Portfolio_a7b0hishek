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

  it('shows only supplied source links and no live deployment links', () => {
    render(<MemoryRouter><ProjectsPage /></MemoryRouter>);

    expect(screen.getAllByRole('link', { name: /GitHub/ })).toHaveLength(2);
    expect(screen.queryByRole('link', { name: /live demo/i })).not.toBeInTheDocument();
  });
});
