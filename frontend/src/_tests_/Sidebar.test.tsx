import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from '../components/layout/Sidebar';

describe('Sidebar', () => {
  const mockOnSelect = vi.fn();

  const defaultProps = {
    contacts: [
      { id: 'user1' },
      { id: 'user2' },
      { id: 'user3' },
    ],
    username: 'currentUser',
    active: 'user1',
    onSelect: mockOnSelect,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render sidebar with title', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
  });

  it('should render contact list', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
    expect(screen.getByText('user3')).toBeInTheDocument();
  });

  it('should not render current user in contact list', () => {
    const props = {
      ...defaultProps,
      contacts: [
        { id: 'user1' },
        { id: 'currentUser' }, // Should be filtered out
        { id: 'user2' },
      ],
      username: 'currentUser',
    };

    render(<Sidebar {...props} />);

    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
    expect(screen.queryByText('currentUser')).not.toBeInTheDocument();
  });

  it('should mark active contact with active class', () => {
    const { container } = render(<Sidebar {...defaultProps} />);

    const activeContact = container.querySelector('.contact-item.active');
    expect(activeContact).toBeInTheDocument();
    expect(activeContact?.textContent).toContain('user1');
  });

  it('should call onSelect when clicking a contact', () => {
    render(<Sidebar {...defaultProps} />);

    const user2Contact = screen.getByText('user2');
    fireEvent.click(user2Contact);

    expect(mockOnSelect).toHaveBeenCalledWith('user2');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('should call onSelect with correct id for different contacts', () => {
    render(<Sidebar {...defaultProps} />);

    fireEvent.click(screen.getByText('user1'));
    expect(mockOnSelect).toHaveBeenCalledWith('user1');

    fireEvent.click(screen.getByText('user3'));
    expect(mockOnSelect).toHaveBeenCalledWith('user3');

    expect(mockOnSelect).toHaveBeenCalledTimes(2);
  });

  it('should render with empty contacts list', () => {
    const props = {
      ...defaultProps,
      contacts: [],
    };

    render(<Sidebar {...props} />);
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
  });

  it('should have correct CSS classes', () => {
    const { container } = render(<Sidebar {...defaultProps} />);

    expect(container.querySelector('.sidebar')).toBeInTheDocument();
    expect(container.querySelector('.sidebar-title')).toBeInTheDocument();
    expect(container.querySelector('.sidebar-icon')).toBeInTheDocument();
    expect(container.querySelector('.contact-list')).toBeInTheDocument();
  });

  it('should render contact icons', () => {
    const { container } = render(<Sidebar {...defaultProps} />);

    const contactIcons = container.querySelectorAll('.contact-icon');
    // Should have 3 icons (user1, user2, user3)
    expect(contactIcons.length).toBe(3);
  });

  it('should render contact labels', () => {
    const { container } = render(<Sidebar {...defaultProps} />);

    const contactLabels = container.querySelectorAll('.contact-label');
    expect(contactLabels.length).toBe(3);
    expect(contactLabels[0].textContent).toBe('user1');
    expect(contactLabels[1].textContent).toBe('user2');
    expect(contactLabels[2].textContent).toBe('user3');
  });

  it('should handle single contact', () => {
    const props = {
      ...defaultProps,
      contacts: [{ id: 'onlyUser' }],
      active: 'onlyUser',
    };

    render(<Sidebar {...props} />);

    expect(screen.getByText('onlyUser')).toBeInTheDocument();
    const { container } = render(<Sidebar {...props} />);
    expect(container.querySelector('.contact-item.active')).toBeInTheDocument();
  });

  it('should update active state when props change', () => {
    const { rerender, container } = render(<Sidebar {...defaultProps} />);

    let activeContact = container.querySelector('.contact-item.active');
    expect(activeContact?.textContent).toContain('user1');

    // Change active user
    rerender(<Sidebar {...defaultProps} active="user2" />);

    activeContact = container.querySelector('.contact-item.active');
    expect(activeContact?.textContent).toContain('user2');
  });

  it('should render aside element', () => {
    const { container } = render(<Sidebar {...defaultProps} />);

    const aside = container.querySelector('aside');
    expect(aside).toBeInTheDocument();
    expect(aside).toHaveClass('sidebar');
  });
});
