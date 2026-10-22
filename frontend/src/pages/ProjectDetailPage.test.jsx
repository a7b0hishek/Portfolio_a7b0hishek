import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProjectDetailPage from './ProjectDetailPage.jsx';

function renderDetail(path) {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/projects/:slug" element={<ProjectDetailPage />} /></Routes></MemoryRouter>);
}

describe('ProjectDetailPage', () => {
  it('renders locally maintained project context', () => {
    renderDetail('/projects/ai-powered-task-management-rest-api');

    expect(screen.getByRole('heading', { name: /AI-Powered Task Management REST API/ })).toBeInTheDocument();
    expect(screen.getByText(/Django REST Framework API backed by PostgreSQL/i)).toBeInTheDocument();
    expect(screen.getByText('Django REST Framework')).toBeInTheDocument();
  });

  it('explains a missing local project and provides a route back', () => {
    renderDetail('/projects/unknown-project');

    expect(screen.getByText('Project not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to projects/i })).toHaveAttribute('href', '/projects');
  });
});
