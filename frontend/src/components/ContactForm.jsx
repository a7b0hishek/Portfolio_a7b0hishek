import { useRef, useState } from 'react';
import { ArrowUpRight, Check, LoaderCircle } from 'lucide-react';

const initialValues = { name: '', email: '', subject: '', message: '' };
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
const WEB3FORMS_ACCESS_KEY = '5641fa05-2d68-424f-bfb6-06f3a1ffecb8';

export default function ContactForm() {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const requestInFlight = useRef(false);

  const update = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    if (status.type !== 'idle' && status.type !== 'submitting') setStatus({ type: 'idle', message: '' });
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setFieldErrors({});
    setStatus({ type: 'submitting', message: '' });

    try {
      const formData = new FormData(event.currentTarget);
      formData.append('access_key', WEB3FORMS_ACCESS_KEY);
      const response = await fetch(WEB3FORMS_ENDPOINT, { method: 'POST', body: formData });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(typeof result.message === 'string' ? result.message : 'Something went wrong. Please try again.');
      }

      setValues(initialValues);
      setStatus({ type: 'success', message: 'Thanks — your message has been sent.' });
    } catch (error) {
      const message = error instanceof Error && error.name === 'Error' && error.message
        ? error.message
        : 'Something went wrong. Please try again.';
      setStatus({ type: 'error', message });
    } finally {
      requestInFlight.current = false;
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <FormField autoComplete="name" error={fieldErrors.name} label="Your name" maxLength={100} name="name" onChange={update} required value={values.name} />
        <FormField autoComplete="email" error={fieldErrors.email} label="Email address" maxLength={254} name="email" onChange={update} required type="email" value={values.email} />
      </div>
      <FormField error={fieldErrors.subject} label="Subject" maxLength={200} name="subject" onChange={update} required value={values.subject} />
      <FormField error={fieldErrors.message} label="Your message" maxLength={5000} name="message" onChange={update} required rows={5} value={values.message} />

      {status.type !== 'idle' && (
        <p aria-live="polite" className={`form-feedback ${status.type}`} role={status.type === 'error' ? 'alert' : 'status'}>
          {status.type === 'success' && <Check aria-hidden="true" size={16} />}
          {status.message}
        </p>
      )}

      <div className="form-submit-row">
        <button className="button button-primary" disabled={status.type === 'submitting'} type="submit">
          {status.type === 'submitting' ? <><LoaderCircle className="spin" size={16} /> Sending…</> : <>Send message <ArrowUpRight size={16} /> </>}
        </button>
        <p>Submissions are stored privately for review.</p>
      </div>
    </form>
  );
}

function FormField({ label, name, error, type = 'text', rows, ...props }) {
  const id = `contact-${name}`;
  const describedBy = error ? `${id}-error` : undefined;
  const common = {
    id,
    name,
    type,
    'aria-invalid': Boolean(error),
    'aria-describedby': describedBy,
    ...props,
  };
  return (
    <div className={`form-field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}<span aria-hidden="true"> *</span></label>
      {rows ? <textarea {...common} rows={rows} /> : <input {...common} />}
      {error && <span className="field-error" id={describedBy}>{error}</span>}
    </div>
  );
}
