import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar.jsx';

describe('Navbar', () => {
  it('renders the portfolio identity and primary navigation', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /abhishek kr sharma home/i })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
    ['About', 'Skills', 'Projects', 'Experience', 'Resume', 'Contact'].forEach((label) => {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: /let’s talk/i })).toHaveAttribute('href', '#contact');
  });

  it('opens and closes the mobile navigation with the keyboard', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Navbar /></MemoryRouter>);
    const toggle = screen.getByRole('button', { name: /open navigation menu/i });
    toggle.focus();
    expect(toggle).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('navigation', { name: /mobile navigation/i })).toBeInTheDocument();
    await user.keyboard(' ');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
