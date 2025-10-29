import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import NavBar from '../components/layout/NavBar';

// Mock useAuth
const mockClear = vi.fn();
vi.mock('../store/useAuth', () => ({
  useAuth: (selector: any) => {
    const state = { clear: mockClear };
    return selector ? selector(state) : state;
  },
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

describe('NavBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render navbar with chat link', () => {
    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    expect(screen.getByText('Chat')).toBeInTheDocument();
  });

  it('should render logout button', () => {
    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

  it('should call clearAuth and navigate on logout', () => {
    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    fireEvent.click(logoutButton);

    expect(mockClear).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('should have correct link to chat', () => {
    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    const chatLink = screen.getByText('Chat').closest('a');
    expect(chatLink).toHaveAttribute('href', '/chat');
  });

  it('should have navbar class', () => {
    const { container } = render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    expect(container.querySelector('.navbar')).toBeInTheDocument();
  });

  it('should have navbar-links container', () => {
    const { container } = render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    expect(container.querySelector('.navbar-links')).toBeInTheDocument();
  });

  it('should have logout-button class on button', () => {
    const { container } = render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    const logoutButton = container.querySelector('.logout-button');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton?.textContent).toBe('Logout');
  });

  it('should render nav element', () => {
    const { container } = render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass('navbar');
  });
});
