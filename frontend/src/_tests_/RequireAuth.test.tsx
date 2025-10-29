import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { RequireAuth } from '../components/RequireAuth/RequireAuth';
import { useAuth } from '../store/useAuth';

// Mock useAuth
vi.mock('../store/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RequireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when user is authenticated', () => {
    (useAuth as any).mockReturnValue({
      accessToken: 'test-token-123',
    });

    render(
      <BrowserRouter>
        <RequireAuth>
          <div>Protected Content</div>
        </RequireAuth>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should not render children when user is not authenticated', () => {
    (useAuth as any).mockReturnValue({
      accessToken: null,
    });

    render(
      <BrowserRouter>
        <RequireAuth>
          <div>Protected Content</div>
        </RequireAuth>
      </BrowserRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to login when no access token', async () => {
    (useAuth as any).mockReturnValue({
      accessToken: null,
    });

    render(
      <BrowserRouter>
        <RequireAuth>
          <div>Protected Content</div>
        </RequireAuth>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should not redirect when user has valid token', () => {
    (useAuth as any).mockReturnValue({
      accessToken: 'valid-token',
    });

    render(
      <BrowserRouter>
        <RequireAuth>
          <div>Protected Content</div>
        </RequireAuth>
      </BrowserRouter>
    );

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should redirect when token changes from valid to null', async () => {
    const { rerender } = render(
      <BrowserRouter>
        <RequireAuth>
          <div>Protected Content</div>
        </RequireAuth>
      </BrowserRouter>
    );

    // First render with valid token
    (useAuth as any).mockReturnValue({
      accessToken: 'valid-token',
    });

    rerender(
      <BrowserRouter>
        <RequireAuth>
          <div>Protected Content</div>
        </RequireAuth>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();

    // Token becomes null
    (useAuth as any).mockReturnValue({
      accessToken: null,
    });

    rerender(
      <BrowserRouter>
        <RequireAuth>
          <div>Protected Content</div>
        </RequireAuth>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should handle empty string token as falsy', async () => {
    (useAuth as any).mockReturnValue({
      accessToken: '',
    });

    render(
      <BrowserRouter>
        <RequireAuth>
          <div>Protected Content</div>
        </RequireAuth>
      </BrowserRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should render complex children when authenticated', () => {
    (useAuth as any).mockReturnValue({
      accessToken: 'test-token',
    });

    render(
      <BrowserRouter>
        <RequireAuth>
          <div>
            <h1>Dashboard</h1>
            <p>Welcome to your dashboard</p>
            <button>Action</button>
          </div>
        </RequireAuth>
      </BrowserRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome to your dashboard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });
});
