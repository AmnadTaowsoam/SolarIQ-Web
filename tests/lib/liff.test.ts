/**
 * Tests for LIFF SDK wrapper
 */

import { initLIFF, getProfile, isLoggedIn, login, logout, getAccessToken, sendMessages, sendTextMessage, sendLocationMessage, closeWindow, isInLINEApp, isLIFFReady } from '../../src/lib/liff'

// Mock @line/liff
jest.mock('@line/liff', () => ({
  init: jest.fn(),
  getProfile: jest.fn(),
  isLoggedIn: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  getAccessToken: jest.fn(),
  isInClient: jest.fn(),
  getContext: jest.fn(),
  getDecodedIDToken: jest.fn(),
  sendMessages: jest.fn(),
  closeWindow: jest.fn(),
  openWindow: jest.fn(),
  getOS: jest.fn(),
  getLineVersion: jest.fn(),
  isApiAvailable: jest.fn(),
  permission: {
    request: jest.fn(),
  },
  shareTargetPicker: jest.fn(),
  scanCode: jest.fn(),
}))

const mockLiff = jest.requireMock('@line/liff')

describe('LIFF SDK Wrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset module state
    jest.resetModules()
  })

  describe('initLIFF', () => {
    it('should initialize LIFF SDK with liffId', async () => {
      mockLiff.init.mockResolvedValue(undefined)
      
      await initLIFF('test-liff-id')
      
      expect(mockLiff.init).toHaveBeenCalledWith({
        liffId: 'test-liff-id',
        withLoginOnExternalBrowser: true,
      })
    })

    it('should not reinitialize if already initialized', async () => {
      mockLiff.init.mockResolvedValue(undefined)
      
      await initLIFF('test-liff-id')
      await initLIFF('test-liff-id')
      
      expect(mockLiff.init).toHaveBeenCalledTimes(1)
    })

    it('should throw error if initialization fails', async () => {
      mockLiff.init.mockRejectedValue(new Error('Init failed'))
      
      await expect(initLIFF('invalid-id')).rejects.toThrow('Init failed')
    })
  })

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockProfile = {
        userId: 'U123456',
        displayName: 'Test User',
        pictureUrl: 'https://example.com/pic.jpg',
        statusMessage: 'Hello',
      }
      mockLiff.getProfile.mockResolvedValue(mockProfile)
      mockLiff.init.mockResolvedValue(undefined)
      
      await initLIFF('test-id')
      const profile = await getProfile()
      
      expect(profile).toEqual(mockProfile)
    })

    it('should throw error if LIFF not initialized', async () => {
      // Re-import to get fresh module state
      const freshLiff = await import('../../src/lib/liff')
      
      await expect(freshLiff.getProfile()).rejects.toThrow('LIFF not initialized')
    })
  })

  describe('isLoggedIn', () => {
    it('should return true if user is logged in', async () => {
      mockLiff.isLoggedIn.mockReturnValue(true)
      mockLiff.init.mockResolvedValue(undefined)
      
      await initLIFF('test-id')
      const result = await isLoggedIn()
      
      expect(result).toBe(true)
    })

    it('should return false if LIFF not initialized', async () => {
      // Re-import to get fresh module state
      const freshLiff = await import('../../src/lib/liff')
      
      const result = await freshLiff.isLoggedIn()
      
      expect(result).toBe(false)
    })
  })

  describe('login', () => {
    it('should call liff.login with redirectUri', async () => {
      mockLiff.init.mockResolvedValue(undefined)
      
      await initLIFF('test-id')
      await login('https://example.com/callback')
      
      expect(mockLiff.login).toHaveBeenCalledWith({
        redirectUri: 'https://example.com/callback',
      })
    })
  })

  describe('logout', () => {
    it('should call liff.logout', async () => {
      mockLiff.init.mockResolvedValue(undefined)
      
      await initLIFF('test-id')
      await logout()
      
      expect(mockLiff.logout).toHaveBeenCalled()
    })
  })

  describe('getAccessToken', () => {
    it('should return access token', async () => {
      mockLiff.getAccessToken.mockReturnValue('test-token')
      mockLiff.init.mockResolvedValue(undefined)
      
      await initLIFF('test-id')
      const token = await getAccessToken()
      
      expect(token).toBe('test-token')
    })

    it('should return null if token not available', async () => {
      mockLiff.getAccessToken.mockImplementation(() => {
        throw new Error('No token')
      })
      mockLiff.init.mockResolvedValue(undefined)
      
      await initLIFF('test-id')
      const token = await getAccessToken()
      
      expect(token).toBeNull()
    })
  })

  describe('isInLINEApp', () => {
    it('should return true when in LINE client', async () => {
      mockLiff.isInClient.mockReturnValue(true)
      
      const result = await isInLINEApp()
      
      expect(result).toBe(true)
    })
  })

  describe('isLIFFReady', () => {
    it('should return false before initialization', () => {
      expect(isLIFFReady()).toBe(false)
    })
  })

  describe('sendMessages', () => {
    it('should send messages when in LINE client', async () => {
      mockLiff.init.mockResolvedValue(undefined)
      mockLiff.isInClient.mockReturnValue(true)
      mockLiff.sendMessages.mockResolvedValue(undefined)
      
      await initLIFF('test-id')
      await sendMessages([{ type: 'text', text: 'Hello' }])
      
      expect(mockLiff.sendMessages).toHaveBeenCalled()
    })

    it('should not send messages when not in LINE client', async () => {
      mockLiff.init.mockResolvedValue(undefined)
      mockLiff.isInClient.mockReturnValue(false)
      
      await initLIFF('test-id')
      await sendMessages([{ type: 'text', text: 'Hello' }])
      
      expect(mockLiff.sendMessages).not.toHaveBeenCalled()
    })
  })

  describe('sendTextMessage', () => {
    it('should send text message', async () => {
      mockLiff.init.mockResolvedValue(undefined)
      mockLiff.isInClient.mockReturnValue(true)
      mockLiff.sendMessages.mockResolvedValue(undefined)
      
      await initLIFF('test-id')
      await sendTextMessage('Test message')
      
      expect(mockLiff.sendMessages).toHaveBeenCalledWith([{
        type: 'text',
        text: 'Test message',
      }])
    })
  })

  describe('sendLocationMessage', () => {
    it('should send location message', async () => {
      mockLiff.init.mockResolvedValue(undefined)
      mockLiff.isInClient.mockReturnValue(true)
      mockLiff.sendMessages.mockResolvedValue(undefined)
      
      await initLIFF('test-id')
      await sendLocationMessage('Home', '123 Main St', 13.7563, 100.5018)
      
      expect(mockLiff.sendMessages).toHaveBeenCalledWith([{
        type: 'location',
        title: 'Home',
        address: '123 Main St',
        latitude: 13.7563,
        longitude: 100.5018,
      }])
    })
  })

  describe('closeWindow', () => {
    it('should call liff.closeWindow', async () => {
      mockLiff.init.mockResolvedValue(undefined)
      
      await initLIFF('test-id')
      await closeWindow()
      
      expect(mockLiff.closeWindow).toHaveBeenCalled()
    })
  })
})
