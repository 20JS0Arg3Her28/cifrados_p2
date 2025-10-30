import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadUsername, getUsername, loadPublicKey, getPublicKey } from '../store/userStore';
import api from '../lib/api';

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('userStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe('loadUsername', () => {
    it('should load username successfully', async () => {
      const mockUsername = 'testuser';
      const mockAccessToken = 'test-token';

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockUsername });
      vi.mocked(api.get).mockResolvedValueOnce({ data: 'public-key' });

      await loadUsername(mockAccessToken);

      expect(api.get).toHaveBeenCalledWith('/user', {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      });

      expect(console.log).toHaveBeenCalledWith('Username loaded:', mockUsername);
    });

    it('should handle errors when loading username', async () => {
      const mockError = new Error('Failed to load username');
      vi.mocked(api.get).mockRejectedValueOnce(mockError);

      await loadUsername('test-token');

      expect(console.error).toHaveBeenCalledWith('Error loading username:', mockError);
    });

    it('should call loadPublicKey after loading username', async () => {
      const mockUsername = 'testuser';
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockUsername });
      vi.mocked(api.get).mockResolvedValueOnce({ data: 'public-key' });

      await loadUsername('test-token');

      // Wait for promises to resolve
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('getUsername', () => {
    it('should return the current username', async () => {
      const mockUsername = 'testuser';
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockUsername });
      vi.mocked(api.get).mockResolvedValueOnce({ data: 'public-key' });

      await loadUsername('test-token');
      const username = getUsername();

      expect(username).toBe(mockUsername);
    });
  });

  describe('loadPublicKey', () => {
    it('should load public key successfully', async () => {
      const mockPublicKey = 'public-key-data';
      const mockAccessToken = 'test-token';
      const mockUsername = 'testuser';

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockPublicKey });

      await loadPublicKey(mockUsername, mockAccessToken);

      expect(api.get).toHaveBeenCalledWith(`/users/${mockUsername}/key`, {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      });

      expect(console.log).toHaveBeenCalledWith('Public Key loaded:', mockPublicKey);
    });

    it('should handle errors when loading public key', async () => {
      const mockError = new Error('Failed to load public key');
      vi.mocked(api.get).mockRejectedValueOnce(mockError);

      await loadPublicKey('testuser', 'test-token');

      expect(console.error).toHaveBeenCalledWith('Error loading Public Key:', mockError);
    });
  });

  describe('getPublicKey', () => {
    it('should return the current public key', () => {
      const publicKey = getPublicKey();
      expect(publicKey).toBeDefined();
    });
  });
});
