describe('env validation', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('throws when required env vars are missing', () => {
    delete process.env.NEXT_PUBLIC_API_URL
    delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

    expect(() => {
      require('@/lib/env')
    }).toThrow('Missing required environment variables')
  })

  it('passes when all required env vars are set', () => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080'
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-key'
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com'
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project'

    expect(() => {
      require('@/lib/env')
    }).not.toThrow()
  })

  it('allows optional env vars to be undefined', () => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080'
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-key'
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com'
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project'
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    const { env } = require('@/lib/env')
    expect(env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).toBeUndefined()
  })
})
