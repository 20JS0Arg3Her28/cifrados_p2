import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login/Login';
import { useAuth } from '../store/useAuth';
import * as api from '@api/api';
import { loadUsername } from '../store/userStore';

// Mock dependencies
vi.mock('../store/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@api/api', () => ({
  signin: vi.fn(),
  googleLoginUrl: 'https://mock-google-login.com',
}));

vi.mock('../store/userStore', () => ({
  loadUsername: vi.fn().mockResolvedValue(undefined),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login', () => {
  const mockSetTokens = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      setTokens: mockSetTokens,
      accessToken: null,
    });
  });

  it('should render login form with all fields', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Código TOTP')).toBeInTheDocument();
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
    expect(screen.getByText('Iniciar sesión con Google')).toBeInTheDocument();
  });

  it('should redirect to chat if user is already authenticated', () => {
    (useAuth as any).mockReturnValue({
      setTokens: mockSetTokens,
      accessToken: 'existing-token',
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(loadUsername).toHaveBeenCalledWith('existing-token');
    expect(mockNavigate).toHaveBeenCalledWith('/chat');
  });

  it('should show error when fields are empty', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const loginButton = screen.getByText('Iniciar sesión');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Todos los campos son obligatorios.')).toBeInTheDocument();
    });
  });

  it('should show error for invalid email', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Código TOTP'), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByText('Iniciar sesión'));

    await waitFor(() => {
      expect(screen.getByText('Correo inválido.')).toBeInTheDocument();
    });
  });

  it('should show error for short password', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByPlaceholderText('Código TOTP'), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByText('Iniciar sesión'));

    await waitFor(() => {
      expect(screen.getByText('La contraseña debe tener al menos 8 caracteres.')).toBeInTheDocument();
    });
  });

  it('should show error for invalid TOTP format', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Código TOTP'), {
      target: { value: '12345' },
    });

    fireEvent.click(screen.getByText('Iniciar sesión'));

    await waitFor(() => {
      expect(screen.getByText('El código TOTP debe tener 6 dígitos numéricos.')).toBeInTheDocument();
    });
  });

  it('should show error for non-numeric TOTP', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Código TOTP'), {
      target: { value: 'abcdef' },
    });

    fireEvent.click(screen.getByText('Iniciar sesión'));

    await waitFor(() => {
      expect(screen.getByText('El código TOTP debe tener 6 dígitos numéricos.')).toBeInTheDocument();
    });
  });

  it('should successfully login with valid credentials', async () => {
    const mockResponse = {
      data: {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
      },
    };

    vi.mocked(api.signin).mockResolvedValue(mockResponse);

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Código TOTP'), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByText('Iniciar sesión'));

    await waitFor(() => {
      expect(api.signin).toHaveBeenCalledWith('test@example.com', 'password123', '123456');
      expect(mockSetTokens).toHaveBeenCalledWith('test-access-token', 'test-refresh-token');
      expect(loadUsername).toHaveBeenCalledWith('test-access-token');
      expect(screen.getByText('Inicio de sesión exitoso.')).toBeInTheDocument();
    });
  });

  it('should show error when login fails', async () => {
    vi.mocked(api.signin).mockRejectedValue(new Error('Invalid credentials'));

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.change(screen.getByPlaceholderText('Código TOTP'), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByText('Iniciar sesión'));

    await waitFor(() => {
      expect(screen.getByText('Error al iniciar sesión. Revisa tus datos.')).toBeInTheDocument();
    });
  });

  it('should navigate to Google login when Google button is clicked', () => {
    delete (window as any).location;
    (window as any).location = { href: '' };

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const googleButton = screen.getByText('Iniciar sesión con Google');
    fireEvent.click(googleButton);

    expect(window.location.href).toBe('https://mock-google-login.com');
  });

  it('should close toast when onClose is called', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByText('Iniciar sesión'));

    await waitFor(() => {
      expect(screen.getByText('Todos los campos son obligatorios.')).toBeInTheDocument();
    });

    // Find and click the close button on the toast
    const toastElement = screen.getByText('Todos los campos son obligatorios.').closest('div');
    if (toastElement && toastElement.querySelector('button')) {
      fireEvent.click(toastElement.querySelector('button')!);
    }

    await waitFor(() => {
      expect(screen.queryByText('Todos los campos son obligatorios.')).not.toBeInTheDocument();
    });
  });
});
