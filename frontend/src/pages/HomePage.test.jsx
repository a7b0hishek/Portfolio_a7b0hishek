import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage.jsx';

describe('HomePage', () => {
  it('renders the cyber hero and local featured project without an API request', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: /building digital experiences/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Original neon developer illustration' })).toHaveAttribute('src', '/neon-developer-hero.png');
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Flock Energy Meter & Transformer Platform' })).toBeInTheDocument();
    expect(screen.getByText('Projects and context.')).toBeInTheDocument();
  });

  it('keeps the resume download actions available', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const resumeDownloads = screen.getAllByRole('link', { name: /download resume/i });
    expect(resumeDownloads).toHaveLength(2);
    resumeDownloads.forEach((link) => {
      expect(link).toHaveAttribute('href', '/Abhishek_Kr_Sharma_Resume.pdf');
      expect(link).toHaveAttribute('download', 'Abhishek_Kr_Sharma_Resume.pdf');
    });
  });
});
