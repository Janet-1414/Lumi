// jest.setup.ts
import '@testing-library/jest-dom'

// Mock next/navigation for all tests
jest.mock('next/navigation', () => ({
  useRouter:    () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  usePathname:  () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement('a', { href }, children),
}))

// Suppress console.error in tests (keeps output clean)
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) return
    originalError(...args)
  }
})
afterAll(() => { console.error = originalError })
