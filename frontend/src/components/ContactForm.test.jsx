import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from './ContactForm.jsx';

describe('ContactForm', () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  async function completeForm(user) {
    await user.type(screen.getByLabelText(/your name/i), 'A. Developer');
    await user.type(screen.getByLabelText(/email address/i), 'person@example.test');
    await user.type(screen.getByLabelText(/subject/i), 'A project question');
    await user.type(screen.getByLabelText(/your message/i), 'I would like to talk about a project.');
  }

  it('uses required fields and shows local validation before submission', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(screen.getByRole('button', { name: /send message/i }));
    expect(screen.getByLabelText(/your name/i)).toBeRequired();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('submits the form to Web3Forms and resets after success', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    render(<ContactForm />);
    await completeForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByRole('status')).toHaveTextContent('Thanks — your message has been sent.');
    expect(fetchMock).toHaveBeenCalledWith('https://api.web3forms.com/submit', expect.objectContaining({ method: 'POST', body: expect.any(FormData) }));
    const submittedData = fetchMock.mock.calls[0][1].body;
    expect(Object.fromEntries(submittedData.entries())).toMatchObject({
      name: 'A. Developer',
      email: 'person@example.test',
      subject: 'A project question',
      message: 'I would like to talk about a project.',
      access_key: '5641fa05-2d68-424f-bfb6-06f3a1ffecb8',
    });
    expect(screen.getByLabelText(/your name/i)).toHaveValue('');
    expect(screen.getByLabelText(/your message/i)).toHaveValue('');
  });

  it('shows the Web3Forms error message and keeps entered values', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ success: false, message: 'Invalid access key.' }) });
    render(<ContactForm />);
    await completeForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid access key.');
    expect(screen.getByLabelText(/your message/i)).toHaveValue('I would like to talk about a project.');
  });

  it('shows a fallback message when the network request fails', async () => {
    const user = userEvent.setup();
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    render(<ContactForm />);
    await completeForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong. Please try again.');
  });

  it('disables the submit button while the request is in flight', async () => {
    const user = userEvent.setup();
    fetchMock.mockReturnValue(new Promise(() => {}));
    render(<ContactForm />);
    await completeForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));
    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
  });
});
