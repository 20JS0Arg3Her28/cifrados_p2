import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SignToggle from '../components/chat/SignToggle';

describe('SignToggle', () => {
  it('should render the toggle component', () => {
    const mockToggle = vi.fn();
    render(<SignToggle enabled={false} onToggle={mockToggle} />);

    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText('Sign Message')).toBeInTheDocument();
  });

  it('should be checked when enabled is true', () => {
    const mockToggle = vi.fn();
    render(<SignToggle enabled={true} onToggle={mockToggle} />);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('should be unchecked when enabled is false', () => {
    const mockToggle = vi.fn();
    render(<SignToggle enabled={false} onToggle={mockToggle} />);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('should call onToggle with true when clicked while disabled', () => {
    const mockToggle = vi.fn();
    render(<SignToggle enabled={false} onToggle={mockToggle} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockToggle).toHaveBeenCalledWith(true);
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('should call onToggle with false when clicked while enabled', () => {
    const mockToggle = vi.fn();
    render(<SignToggle enabled={true} onToggle={mockToggle} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockToggle).toHaveBeenCalledWith(false);
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('should toggle multiple times', () => {
    const mockToggle = vi.fn();
    const { rerender } = render(<SignToggle enabled={false} onToggle={mockToggle} />);

    const checkbox = screen.getByRole('checkbox');

    // First click
    fireEvent.click(checkbox);
    expect(mockToggle).toHaveBeenCalledWith(true);

    // Update component state
    rerender(<SignToggle enabled={true} onToggle={mockToggle} />);

    // Second click
    fireEvent.click(checkbox);
    expect(mockToggle).toHaveBeenCalledWith(false);

    expect(mockToggle).toHaveBeenCalledTimes(2);
  });

  it('should have correct checkbox id and label association', () => {
    const mockToggle = vi.fn();
    render(<SignToggle enabled={false} onToggle={mockToggle} />);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    const label = screen.getByText('Sign Message').closest('label');

    expect(checkbox.id).toBe('sign-toggle');
    expect(label?.getAttribute('for')).toBe('sign-toggle');
  });

  it('should display the pencil icon', () => {
    const mockToggle = vi.fn();
    const { container } = render(<SignToggle enabled={false} onToggle={mockToggle} />);

    const icon = container.querySelector('.toggle-icon');
    expect(icon).toBeInTheDocument();
  });

  it('should have proper CSS classes', () => {
    const mockToggle = vi.fn();
    const { container } = render(<SignToggle enabled={false} onToggle={mockToggle} />);

    expect(container.querySelector('.toggle-container')).toBeInTheDocument();
    expect(container.querySelector('.toggle-checkbox')).toBeInTheDocument();
    expect(container.querySelector('.toggle-label')).toBeInTheDocument();
    expect(container.querySelector('.toggle-icon')).toBeInTheDocument();
  });

  it('should render with correct initial state', () => {
    const mockToggle = vi.fn();
    const { container } = render(<SignToggle enabled={false} onToggle={mockToggle} />);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    expect(container).toBeInTheDocument();
  });
});
