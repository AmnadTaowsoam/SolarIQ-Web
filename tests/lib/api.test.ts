import axios from 'axios'

// Mock firebase before importing api
jest.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
}))

jest.mock('firebase/auth', () => ({
  getIdToken: jest.fn(),
}))

// Mock axios
jest.mock('axios', () => {
  const mockInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  }
  return {
    create: jest.fn(() => mockInstance),
    __mockInstance: mockInstance,
  }
})

describe('ApiClient', () => {
  it('creates axios instance with correct config', () => {
    // Re-import to trigger constructor
    jest.isolateModules(() => {
      require('@/lib/api')
    })

    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: expect.any(String),
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' },
      })
    )
  })

  it('sets up request and response interceptors', () => {
    const mockInstance = (axios as any).__mockInstance
    jest.isolateModules(() => {
      require('@/lib/api')
    })

    expect(mockInstance.interceptors.request.use).toHaveBeenCalled()
    expect(mockInstance.interceptors.response.use).toHaveBeenCalled()
  })
})
