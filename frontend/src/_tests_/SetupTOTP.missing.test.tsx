import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SetupTOTP from '../components/SetupTOTP/SetupTOTP';

describe('SetupTOTP - Missing State Coverage', () => {
  it('should show error when state is null', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/setup-totp', state: null }]}>
        <Routes>
          <Route path="/setup-totp" element={<SetupTOTP />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Información incompleta/i)).toBeInTheDocument();
  });

  it('should show error when state is missing email', () => {
    render(
      <MemoryRouter
        initialEntries={[{
          pathname: '/setup-totp',
          state: { qr: 'someqr', secret: 'somesecret' }
        }]}
      >
        <Routes>
          <Route path="/setup-totp" element={<SetupTOTP />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Información incompleta/i)).toBeInTheDocument();
  });

  it('should show error when state is missing qr', () => {
    render(
      <MemoryRouter
        initialEntries={[{
          pathname: '/setup-totp',
          state: { email: 'test@test.com', secret: 'somesecret' }
        }]}
      >
        <Routes>
          <Route path="/setup-totp" element={<SetupTOTP />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Información incompleta/i)).toBeInTheDocument();
  });

  it('should show error when state is missing secret', () => {
    render(
      <MemoryRouter
        initialEntries={[{
          pathname: '/setup-totp',
          state: { email: 'test@test.com', qr: 'someqr' }
        }]}
      >
        <Routes>
          <Route path="/setup-totp" element={<SetupTOTP />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Información incompleta/i)).toBeInTheDocument();
  });

  it('should show error when state is undefined', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/setup-totp' }]}>
        <Routes>
          <Route path="/setup-totp" element={<SetupTOTP />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Información incompleta/i)).toBeInTheDocument();
  });

  it('should render correctly with complete state', () => {
    const completeState = {
      email: 'test@test.com',
      qr: 'iVBORw0KGgoAAAANSUhEUgAAAAUA',
      secret: 'JBSWY3DPEHPK3PXP'
    };

    render(
      <MemoryRouter
        initialEntries={[{
          pathname: '/setup-totp',
          state: completeState
        }]}
      >
        <Routes>
          <Route path="/setup-totp" element={<SetupTOTP />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Configura tu autenticador/i)).toBeInTheDocument();
    expect(screen.getByText(completeState.secret)).toBeInTheDocument();
    expect(screen.queryByText(/Información incompleta/i)).not.toBeInTheDocument();
  });
});
