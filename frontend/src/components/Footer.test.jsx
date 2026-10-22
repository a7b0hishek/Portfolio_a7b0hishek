import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer.jsx';

describe('Footer', () => {
  it('shows resume-provided links with safe external-link behavior', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);

    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href', 'https://linkedin.com/in/a7b0hishek',
    );
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'rel', 'noreferrer noopener',
    );
    expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute(
      'href', 'mailto:a7b0hishek@gmail.com',
    );
  });
});
