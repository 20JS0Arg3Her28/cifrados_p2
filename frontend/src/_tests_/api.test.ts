import { describe, it, expect, vi, beforeEach } from 'vitest';
import API, { googleLoginUrl, signup, signin } from '../lib/api';

vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    post: vi.fn(),
    get: vi.fn(),
    defaults: { baseURL: 'http://localhost:8000' },
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return { default: mockAxios };
});

describe('api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('API instance', () => {
    it('should have correct baseURL', () => {
      expect(API.defaults.baseURL).toBe('http://localhost:8000');
    });

    it('should be an axios instance', () => {
      expect(API).toBeDefined();
      expect(API.post).toBeDefined();
      expect(API.get).toBeDefined();
    });
  });

  describe('googleLoginUrl', () => {
    it('should export correct Google login URL', () => {
      expect(googleLoginUrl).toBe('http://localhost:8000/auth/google/login');
    });
  });

  describe('interceptors', () => {
    it('should have interceptors object defined', () => {
      expect(API.interceptors).toBeDefined();
      expect(API.interceptors.request).toBeDefined();
      expect(API.interceptors.response).toBeDefined();
    });
  });

  describe('signup function', () => {
    it('should call API.post with correct parameters', async () => {
      const mockResponse = { data: { message: 'success' } };
      vi.mocked(API.post).mockResolvedValueOnce(mockResponse);

      await signup('test@example.com', 'password123');

      expect(API.post).toHaveBeenCalledWith(
        '/auth/signup',
        { email: 'test@example.com', password: 'password123' },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    });
  });

  describe('signin function', () => {
    it('should call API.post with correct parameters', async () => {
      const mockResponse = { data: { access_token: 'token123' } };
      vi.mocked(API.post).mockResolvedValueOnce(mockResponse);

      await signin('test@example.com', 'password123', '123456');

      expect(API.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
        totp_code: '123456',
      });
    });
  });
});
