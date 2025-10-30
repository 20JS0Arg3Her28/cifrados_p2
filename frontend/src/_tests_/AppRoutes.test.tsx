import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from '../routes/AppRoutes';

// Mock all page components
vi.mock('@pages/SignUp/Signup', () => ({
  default: () => <div>Signup Page</div>,
}));

vi.mock('@pages/Login/Login', () => ({
  default: () => <div>Login Page</div>,
}));

vi.mock('@pages/Chat/P2PChatPage', () => ({
  default: () => <div>Chat Page</div>,
}));

vi.mock('@pages/Chat/GroupChatPage', () => ({
  default: () => <div>Group Chat Page</div>,
}));

vi.mock('@pages/Other/RequestInterface', () => ({
  default: () => <div>Request Interface Page</div>,
}));

vi.mock('@pages/OAuthCallback/OAuthCallback', () => ({
  default: () => <div>OAuth Callback Page</div>,
}));

// Mock route guards
vi.mock('../routes/guards/RouteGuards', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PublicOnlyRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('AppRoutes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render signup page on /signup route', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText('Signup Page')).toBeInTheDocument();
  });

  it('should render login page on /login route', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('should render chat page on /chat route', () => {
    render(
      <MemoryRouter initialEntries={['/chat']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText('Chat Page')).toBeInTheDocument();
  });

  it('should render group chat page on /group-chat route', () => {
    render(
      <MemoryRouter initialEntries={['/group-chat']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText('Group Chat Page')).toBeInTheDocument();
  });

  it('should render request interface page on /verify route', () => {
    render(
      <MemoryRouter initialEntries={['/verify']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText('Request Interface Page')).toBeInTheDocument();
  });

  it('should render oauth callback page on /oauth-callback route', () => {
    render(
      <MemoryRouter initialEntries={['/oauth-callback']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText('OAuth Callback Page')).toBeInTheDocument();
  });

  it('should redirect unknown routes to /chat', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-route']}>
        <AppRoutes />
      </MemoryRouter>
    );
    // Should redirect to /chat which shows Chat Page
    expect(screen.getByText('Chat Page')).toBeInTheDocument();
  });
});
