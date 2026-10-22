import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(cleanup);

// Framer Motion probes scroll position while resolving animations; jsdom has
// no layout viewport and otherwise emits a "not implemented" warning.
window.scrollTo = vi.fn();

class TestIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.IntersectionObserver = TestIntersectionObserver;
