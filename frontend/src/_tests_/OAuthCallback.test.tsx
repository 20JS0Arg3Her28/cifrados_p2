import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import OAuthCallback from '../pages/OAuthCallback/OAuthCallback';
import { useAuth } from '../store/useAuth';
import { loadUsername } from '../store/userStore';

// Mock dependencies
vi.mock('../store/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../store/userStore', () => ({
  loadUsername: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('OAuthCallback', () => {
  const mockSetTokens = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      setTokens: mockSetTokens,
    });
  });

  it('should render loading message', () => {
    render(
      <BrowserRouter>
        <OAuthCallback />
      </BrowserRouter>
    );

    expect(screen.getByText('Procesando autenticación de Google...')).toBeInTheDocument();
  });

  it('should set tokens and navigate to chat when tokens are present', async () => {
    // Mock URL search params
    delete (window as any).location;
    (window as any).location = {
      search: '?access_token=test-access&refresh_token=test-refresh',
    };

    render(
      <BrowserRouter>
        <OAuthCallback />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockSetTokens).toHaveBeenCalledWith('test-access', 'test-refresh');
      expect(loadUsername).toHaveBeenCalledWith('test-access');
      expect(mockNavigate).toHaveBeenCalledWith('/chat');
    });
  });

  it('should navigate to login when tokens are missing', async () => {
    delete (window as any).location;
    (window as any).location = {
      search: '',
    };

    render(
      <BrowserRouter>
        <OAuthCallback />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockSetTokens).not.toHaveBeenCalled();
      expect(loadUsername).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should navigate to login when only access token is present', async () => {
    delete (window as any).location;
    (window as any).location = {
      search: '?access_token=test-access',
    };

    render(
      <BrowserRouter>
        <OAuthCallback />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should navigate to login when only refresh token is present', async () => {
    delete (window as any).location;
    (window as any).location = {
      search: '?refresh_token=test-refresh',
    };

    render(
      <BrowserRouter>
        <OAuthCallback />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
