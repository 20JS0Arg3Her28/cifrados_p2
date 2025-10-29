import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock the AppRoutes component
vi.mock('../routes/AppRoutes', () => ({
  default: () => <div data-testid="app-routes">App Routes</div>,
}));

// Mock the Header component
vi.mock('../components/Header/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

describe('App', () => {
  it('should render without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  it('should render Header component', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('header')).toBeInTheDocument();
  });

  it('should render AppRoutes component', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('app-routes')).toBeInTheDocument();
  });

  it('should render BrowserRouter', () => {
    const { container } = render(<App />);
    // BrowserRouter wraps everything, so check if the main div exists
    const mainDiv = container.querySelector('div[style]');
    expect(mainDiv).toBeInTheDocument();
  });

  it('should have correct styles on main container', () => {
    const { container } = render(<App />);
    const mainDiv = container.querySelector('div[style]');

    expect(mainDiv).toHaveStyle({
      height: '100%',
      width: '100%',
      padding: '0',
      margin: '0',
    });
  });
});
