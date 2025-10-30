import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import SetupTOTP from '../components/SetupTOTP/SetupTOTP';

// Mock useLocation and useNavigate
const mockNavigate = vi.fn();
const mockState = {
  email: 'test@example.com',
  qr: 'iVBORw0KGgoAAAANSUhEUgAAAAUA',
  secret: 'JBSWY3DPEHPK3PXP',
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ state: mockState }),
    useNavigate: () => mockNavigate,
  };
});

describe('SetupTOTP', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render title', () => {
    render(
      <BrowserRouter>
        <SetupTOTP />
      </BrowserRouter>
    );
    expect(screen.getByText('Configura tu autenticador')).toBeInTheDocument();
  });

  it('should render QR code image', () => {
    render(
      <BrowserRouter>
        <SetupTOTP />
      </BrowserRouter>
    );

    const qrImage = screen.getByAltText('TOTP QR Code');
    expect(qrImage).toBeInTheDocument();
    expect(qrImage).toHaveAttribute('src', `data:image/png;base64,${mockState.qr}`);
  });

  it('should render TOTP secret', () => {
    render(
      <BrowserRouter>
        <SetupTOTP />
      </BrowserRouter>
    );

    expect(screen.getByText(/copia este código manualmente:/i)).toBeInTheDocument();
    expect(screen.getByText(mockState.secret)).toBeInTheDocument();
  });

  it('should render instructions', () => {
    render(
      <BrowserRouter>
        <SetupTOTP />
      </BrowserRouter>
    );

    expect(screen.getByText(/Escanea este código QR/i)).toBeInTheDocument();
  });

  it('should navigate to login when button is clicked', () => {
    render(
      <BrowserRouter>
        <SetupTOTP />
      </BrowserRouter>
    );

    const loginButton = screen.getByRole('button', { name: /Ir al login/i });
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should render button', () => {
    render(
      <BrowserRouter>
        <SetupTOTP />
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /Ir al login/i });
    expect(button).toBeInTheDocument();
  });

  it('should render all required elements', () => {
    render(
      <BrowserRouter>
        <SetupTOTP />
      </BrowserRouter>
    );

    expect(screen.getByText('Configura tu autenticador')).toBeInTheDocument();
    expect(screen.getByAltText('TOTP QR Code')).toBeInTheDocument();
    expect(screen.getByText(mockState.secret)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ir al login/i })).toBeInTheDocument();
  });

  it('should have proper structure', () => {
    const { container } = render(
      <BrowserRouter>
        <SetupTOTP />
      </BrowserRouter>
    );

    expect(container.querySelector('img')).toBeInTheDocument();
    expect(container.querySelector('code')).toBeInTheDocument();
    expect(container.querySelector('button')).toBeInTheDocument();
  });

});
