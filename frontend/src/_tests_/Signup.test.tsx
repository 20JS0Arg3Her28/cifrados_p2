import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Signup from '../pages/SignUp/Signup';
import * as api from '@api/api';
import { AxiosError } from 'axios';

// Mock dependencies
vi.mock('@api/api', () => ({
  signup: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ search: '' }),
  };
});

describe('Signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render signup form with all fields', () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByText('Crear cuenta')).toBeInTheDocument();
    expect(screen.getByText('Registrarse con Google')).toBeInTheDocument();
  });

  it('should show error when fields are empty', async () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    const signupButton = screen.getByText('Crear cuenta');
    fireEvent.click(signupButton);

    await waitFor(() => {
      expect(screen.getByText('Todos los campos son obligatorios.')).toBeInTheDocument();
    });
  });

  it('should show error for invalid email', async () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByText('Crear cuenta'));

    await waitFor(() => {
      expect(screen.getByText('El correo electrónico no es válido.')).toBeInTheDocument();
    });
  });

  it('should show error for short password', async () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'short' },
    });

    fireEvent.click(screen.getByText('Crear cuenta'));

    await waitFor(() => {
      expect(screen.getByText('La contraseña debe tener al menos 8 caracteres.')).toBeInTheDocument();
    });
  });

  it('should successfully signup and display QR code', async () => {
    const mockResponse = {
      data: {
        created: true,
        qr_code_base64: 'mock-base64-qr-code',
        totp_secret: 'MOCK-TOTP-SECRET',
      },
    };

    vi.mocked(api.signup).mockResolvedValue(mockResponse);

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByText('Crear cuenta'));

    await waitFor(() => {
      expect(api.signup).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(screen.getByText('Registro exitoso')).toBeInTheDocument();
      expect(screen.getByText('Escanea este código QR en tu app de autenticación:')).toBeInTheDocument();
      expect(screen.getByAltText('TOTP QR Code')).toHaveAttribute(
        'src',
        'data:image/png;base64,mock-base64-qr-code'
      );
      expect(screen.getByText('MOCK-TOTP-SECRET')).toBeInTheDocument();
      expect(screen.getByText('Ir al login')).toBeInTheDocument();
    });
  });

  it('should navigate to login after successful registration', async () => {
    const mockResponse = {
      data: {
        created: true,
        qr_code_base64: 'mock-base64-qr-code',
        totp_secret: 'MOCK-TOTP-SECRET',
      },
    };

    vi.mocked(api.signup).mockResolvedValue(mockResponse);

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByText('Crear cuenta'));

    await waitFor(() => {
      expect(screen.getByText('Ir al login')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Ir al login'));

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should show error when email is already registered', async () => {
    const mockError = new AxiosError('Email already registered');
    mockError.response = {
      data: {
        detail: 'Email already registered',
      },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as any,
    };

    vi.mocked(api.signup).mockRejectedValue(mockError);

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'existing@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByText('Crear cuenta'));

    await waitFor(() => {
      expect(screen.getByText('Este correo electrónico ya está registrado. ¿Quieres iniciar sesión?')).toBeInTheDocument();
    });
  });

  it('should show generic error when signup fails', async () => {
    const mockError = new AxiosError('Some other error');
    mockError.response = {
      data: {
        detail: 'Some other error',
      },
      status: 500,
      statusText: 'Internal Server Error',
      headers: {},
      config: {} as any,
    };

    vi.mocked(api.signup).mockRejectedValue(mockError);

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByText('Crear cuenta'));

    await waitFor(() => {
      expect(screen.getByText('Error durante el registro. Inténtalo de nuevo.')).toBeInTheDocument();
    });
  });

  it('should show error for unknown error type', async () => {
    vi.mocked(api.signup).mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByText('Crear cuenta'));

    await waitFor(() => {
      expect(screen.getByText('Error desconocido. Inténtalo de nuevo.')).toBeInTheDocument();
    });
  });

  it('should navigate to Google signup when Google button is clicked', () => {
    delete (window as any).location;
    (window as any).location = { href: '' };

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    const googleButton = screen.getByText('Registrarse con Google');
    fireEvent.click(googleButton);

    expect(window.location.href).toBe('http://localhost:8000/auth/google/login');
  });

  it('should close toast when onClose is called', async () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByText('Crear cuenta'));

    await waitFor(() => {
      expect(screen.getByText('Todos los campos son obligatorios.')).toBeInTheDocument();
    });

    const toastElement = screen.getByText('Todos los campos son obligatorios.').closest('div');
    if (toastElement && toastElement.querySelector('button')) {
      fireEvent.click(toastElement.querySelector('button')!);
    }

    await waitFor(() => {
      expect(screen.queryByText('Todos los campos son obligatorios.')).not.toBeInTheDocument();
    });
  });
});
