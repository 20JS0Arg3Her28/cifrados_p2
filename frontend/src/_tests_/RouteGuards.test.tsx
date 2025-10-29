import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from '../routes/guards/RouteGuards';
import { useAuth } from '../store/useAuth';

// Mock useAuth
vi.mock('../store/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock Navigate component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>,
  };
});

describe('RouteGuards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ProtectedRoute', () => {
    it('should render children when user is authenticated', () => {
      (useAuth as any).mockReturnValue({
        accessToken: 'test-token',
      });

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });

    it('should redirect to login when user is not authenticated', () => {
      (useAuth as any).mockReturnValue({
        accessToken: null,
      });

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveTextContent('/login');
    });

    it('should handle empty string token as falsy', () => {
      (useAuth as any).mockReturnValue({
        accessToken: '',
      });

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveTextContent('/login');
    });
  });

  describe('PublicOnlyRoute', () => {
    it('should render children when user is not authenticated', () => {
      (useAuth as any).mockReturnValue({
        accessToken: null,
      });

      render(
        <BrowserRouter>
          <PublicOnlyRoute>
            <div>Public Content</div>
          </PublicOnlyRoute>
        </BrowserRouter>
      );

      expect(screen.getByText('Public Content')).toBeInTheDocument();
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });

    it('should redirect to chat when user is authenticated', () => {
      (useAuth as any).mockReturnValue({
        accessToken: 'test-token',
      });

      render(
        <BrowserRouter>
          <PublicOnlyRoute>
            <div>Public Content</div>
          </PublicOnlyRoute>
        </BrowserRouter>
      );

      expect(screen.queryByText('Public Content')).not.toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveTextContent('/chat');
    });

    it('should handle empty string token as falsy', () => {
      (useAuth as any).mockReturnValue({
        accessToken: '',
      });

      render(
        <BrowserRouter>
          <PublicOnlyRoute>
            <div>Public Content</div>
          </PublicOnlyRoute>
        </BrowserRouter>
      );

      expect(screen.getByText('Public Content')).toBeInTheDocument();
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });
  });
});
