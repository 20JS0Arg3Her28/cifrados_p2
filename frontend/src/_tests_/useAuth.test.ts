import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAuth } from '../store/useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset store state
    useAuth.setState({ accessToken: null, refreshToken: null });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with null tokens when localStorage is empty', () => {
    const { accessToken, refreshToken } = useAuth.getState();
    expect(accessToken).toBeNull();
    expect(refreshToken).toBeNull();
  });

  it('should set tokens in state and localStorage', () => {
    const { setTokens } = useAuth.getState();
    const testAccessToken = 'test-access-token';
    const testRefreshToken = 'test-refresh-token';

    setTokens(testAccessToken, testRefreshToken);

    const { accessToken, refreshToken } = useAuth.getState();
    expect(accessToken).toBe(testAccessToken);
    expect(refreshToken).toBe(testRefreshToken);
    expect(localStorage.getItem('accessToken')).toBe(testAccessToken);
    expect(localStorage.getItem('refreshToken')).toBe(testRefreshToken);
  });

  it('should clear tokens on logout', () => {
    const { setTokens, logout } = useAuth.getState();

    // Set tokens first
    setTokens('access-token', 'refresh-token');
    expect(useAuth.getState().accessToken).toBe('access-token');

    // Logout
    logout();

    const { accessToken, refreshToken } = useAuth.getState();
    expect(accessToken).toBeNull();
    expect(refreshToken).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('should clear tokens with clear method', () => {
    const { setTokens, clear } = useAuth.getState();

    // Set tokens first
    setTokens('access-token', 'refresh-token');
    expect(useAuth.getState().accessToken).toBe('access-token');

    // Clear
    clear();

    const { accessToken, refreshToken } = useAuth.getState();
    expect(accessToken).toBeNull();
    expect(refreshToken).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('should clear all localStorage on logout', () => {
    const { setTokens, logout } = useAuth.getState();

    // Set tokens and other items in localStorage
    setTokens('access-token', 'refresh-token');
    localStorage.setItem('otherItem', 'value');

    expect(localStorage.getItem('otherItem')).toBe('value');

    // Logout should clear everything
    logout();

    expect(localStorage.getItem('otherItem')).toBeNull();
  });

  it('should update tokens when setTokens is called multiple times', () => {
    const { setTokens } = useAuth.getState();

    setTokens('token1', 'refresh1');
    expect(useAuth.getState().accessToken).toBe('token1');

    setTokens('token2', 'refresh2');
    expect(useAuth.getState().accessToken).toBe('token2');
    expect(useAuth.getState().refreshToken).toBe('refresh2');
  });
});
