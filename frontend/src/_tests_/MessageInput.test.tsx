import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MessageInput from '../components/chat/MessageInput';

describe('MessageInput', () => {
  it('should render input field and send button', () => {
    const mockSend = vi.fn();
    render(<MessageInput onSend={mockSend} />);

    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should update input value when typing', () => {
    const mockSend = vi.fn();
    render(<MessageInput onSend={mockSend} />);

    const input = screen.getByPlaceholderText('Type a message...') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Hello' } });

    expect(input.value).toBe('Hello');
  });

  it('should call onSend with trimmed text when send button is clicked', () => {
    const mockSend = vi.fn();
    render(<MessageInput onSend={mockSend} />);

    const input = screen.getByPlaceholderText('Type a message...') as HTMLInputElement;
    const sendButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'Hello World' } });
    fireEvent.click(sendButton);

    expect(mockSend).toHaveBeenCalledWith('Hello World');
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('should clear input after sending message', () => {
    const mockSend = vi.fn();
    render(<MessageInput onSend={mockSend} />);

    const input = screen.getByPlaceholderText('Type a message...') as HTMLInputElement;
    const sendButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    expect(input.value).toBe('');
  });

  it('should not send empty message', () => {
    const mockSend = vi.fn();
    render(<MessageInput onSend={mockSend} />);

    const sendButton = screen.getByRole('button');

    fireEvent.click(sendButton);

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should not send message with only whitespace', () => {
    const mockSend = vi.fn();
    render(<MessageInput onSend={mockSend} />);

    const input = screen.getByPlaceholderText('Type a message...') as HTMLInputElement;
    const sendButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(sendButton);

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should send message when Enter key is pressed', () => {
    const mockSend = vi.fn();
    render(<MessageInput onSend={mockSend} />);

    const input = screen.getByPlaceholderText('Type a message...') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Hello from Enter' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockSend).toHaveBeenCalledWith('Hello from Enter');
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('should clear input after sending with Enter key', () => {
    const mockSend = vi.fn();
    render(<MessageInput onSend={mockSend} />);

    const input = screen.getByPlaceholderText('Type a message...') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(input.value).toBe('');
  });

  it('should not send when other keys are pressed', () => {
    const mockSend = vi.fn();
    render(<MessageInput onSend={mockSend} />);

    const input = screen.getByPlaceholderText('Type a message...') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.keyDown(input, { key: 'a', code: 'KeyA' });
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should trim whitespace from message', () => {
    const mockSend = vi.fn();
    render(<MessageInput onSend={mockSend} />);

    const input = screen.getByPlaceholderText('Type a message...') as HTMLInputElement;
    const sendButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: '  Hello World  ' } });
    fireEvent.click(sendButton);

    expect(mockSend).toHaveBeenCalledWith('Hello World');
  });

  it('should allow sending multiple messages', () => {
    const mockSend = vi.fn();
    render(<MessageInput onSend={mockSend} />);

    const input = screen.getByPlaceholderText('Type a message...') as HTMLInputElement;
    const sendButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'First message' } });
    fireEvent.click(sendButton);

    fireEvent.change(input, { target: { value: 'Second message' } });
    fireEvent.click(sendButton);

    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(mockSend).toHaveBeenNthCalledWith(1, 'First message');
    expect(mockSend).toHaveBeenNthCalledWith(2, 'Second message');
  });

  it('should have correct CSS classes', () => {
    const mockSend = vi.fn();
    const { container } = render(<MessageInput onSend={mockSend} />);

    expect(container.querySelector('.input-container')).toBeInTheDocument();
    expect(container.querySelector('.input-field')).toBeInTheDocument();
    expect(container.querySelector('.send-button')).toBeInTheDocument();
    expect(container.querySelector('.send-icon')).toBeInTheDocument();
  });

  it('should have correct input type', () => {
    const mockSend = vi.fn();
    render(<MessageInput onSend={mockSend} />);

    const input = screen.getByPlaceholderText('Type a message...') as HTMLInputElement;

    expect(input.type).toBe('text');
  });
});
