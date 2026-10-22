import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ResumeSection from './ResumeSection.jsx';

describe('ResumeSection', () => {
  it('offers the supplied PDF as a named download and safe new-tab view', () => {
    render(<ResumeSection />);

    expect(screen.getByRole('heading', { name: 'A little more about my background.' })).toBeInTheDocument();

    const download = screen.getByRole('link', { name: /download resume/i });
    expect(download).toHaveAttribute('href', '/Abhishek_Kr_Sharma_Resume.pdf');
    expect(download).toHaveAttribute('download', 'Abhishek_Kr_Sharma_Resume.pdf');

    const view = screen.getByRole('link', { name: /view resume/i });
    expect(view).toHaveAttribute('href', '/Abhishek_Kr_Sharma_Resume.pdf');
    expect(view).toHaveAttribute('target', '_blank');
    expect(view).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
