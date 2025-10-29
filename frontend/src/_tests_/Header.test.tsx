import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../components/Header/Header';
import { useAuth } from '../store/useAuth';

// Mock the useAuth hook
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

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show Signup and Login links when not authenticated', () => {
    (useAuth as any).mockReturnValue({
      accessToken: null,
      logout: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText('Signup')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('should show authenticated navigation when user is logged in', () => {
    (useAuth as any).mockReturnValue({
      accessToken: 'test-token',
      logout: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText('P2P Chat')).toBeInTheDocument();
    expect(screen.getByText('Group Chat')).toBeInTheDocument();
    expect(screen.getByText('Verify')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Signup')).not.toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('should call logout and navigate when logout button is clicked', () => {
    const mockLogout = vi.fn();
    (useAuth as any).mockReturnValue({
      accessToken: 'test-token',
      logout: mockLogout,
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should have correct links for unauthenticated state', () => {
    (useAuth as any).mockReturnValue({
      accessToken: null,
      logout: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const signupLink = screen.getByText('Signup').closest('a');
    const loginLink = screen.getByText('Login').closest('a');

    expect(signupLink).toHaveAttribute('href', '/signup');
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should have correct links for authenticated state', () => {
    (useAuth as any).mockReturnValue({
      accessToken: 'test-token',
      logout: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const p2pChatLink = screen.getByText('P2P Chat').closest('a');
    const groupChatLink = screen.getByText('Group Chat').closest('a');
    const verifyLink = screen.getByText('Verify').closest('a');

    expect(p2pChatLink).toHaveAttribute('href', '/chat');
    expect(groupChatLink).toHaveAttribute('href', '/group-chat');
    expect(verifyLink).toHaveAttribute('href', '/verify');
  });

  it('should render header element', () => {
    (useAuth as any).mockReturnValue({
      accessToken: null,
      logout: vi.fn(),
    });

    const { container } = render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('should render nav element', () => {
    (useAuth as any).mockReturnValue({
      accessToken: null,
      logout: vi.fn(),
    });

    const { container } = render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });
});
