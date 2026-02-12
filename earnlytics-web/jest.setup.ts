import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return {
      get: jest.fn(),
      has: jest.fn(),
      getAll: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
}))

// Mock next/headers
jest.mock('next/headers', () => ({
  headers() {
    return new Headers()
  },
  cookies() {
    return {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    }
  },
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Suppress console errors during tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}
