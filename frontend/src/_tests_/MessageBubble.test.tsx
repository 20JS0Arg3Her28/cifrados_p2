import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MessageBubble from '../components/chat/MessageBubble';
import { MessageResponse } from '../types';

describe('MessageBubble', () => {
  const baseMessage: MessageResponse = {
    sender: 'user1',
    receiver: 'user2',
    message: 'Test message',
    hash: 'hash123',
    timestamp: '2025-01-29T10:30:00.000Z',
  };

  it('should render message text', () => {
    render(<MessageBubble msg={baseMessage} me={false} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should display formatted timestamp', () => {
    render(<MessageBubble msg={baseMessage} me={false} />);
    // The timestamp should be formatted to local time
    const timeElement = screen.getByText(/\d{1,2}:\d{2}/);
    expect(timeElement).toBeInTheDocument();
  });

  it('should apply "right" class when message is from me', () => {
    const { container } = render(<MessageBubble msg={baseMessage} me={true} />);
    const wrapper = container.querySelector('.bubble-wrapper');
    expect(wrapper).toHaveClass('right');
    expect(wrapper).not.toHaveClass('left');
  });

  it('should apply "left" class when message is from other user', () => {
    const { container } = render(<MessageBubble msg={baseMessage} me={false} />);
    const wrapper = container.querySelector('.bubble-wrapper');
    expect(wrapper).toHaveClass('left');
    expect(wrapper).not.toHaveClass('right');
  });

  it('should apply "bubble-me" class for my messages', () => {
    const { container } = render(<MessageBubble msg={baseMessage} me={true} />);
    const bubble = container.querySelector('.bubble');
    expect(bubble).toHaveClass('bubble-me');
    expect(bubble).not.toHaveClass('bubble-other');
  });

  it('should apply "bubble-other" class for other user messages', () => {
    const { container } = render(<MessageBubble msg={baseMessage} me={false} />);
    const bubble = container.querySelector('.bubble');
    expect(bubble).toHaveClass('bubble-other');
    expect(bubble).not.toHaveClass('bubble-me');
  });

  it('should show signature icon when message is signed', () => {
    const signedMessage: MessageResponse = {
      ...baseMessage,
      signature: 'Signed',
    };
    render(<MessageBubble msg={signedMessage} me={false} />);
    const icon = document.querySelector('.bubble-icon');
    expect(icon).toBeInTheDocument();
  });

  it('should not show signature icon when message is not signed', () => {
    render(<MessageBubble msg={baseMessage} me={false} />);
    const icon = document.querySelector('.bubble-icon');
    expect(icon).not.toBeInTheDocument();
  });

  it('should apply "bubble-signed" class when signature is "Signed"', () => {
    const signedMessage: MessageResponse = {
      ...baseMessage,
      signature: 'Signed',
    };
    const { container } = render(<MessageBubble msg={signedMessage} me={false} />);
    const bubble = container.querySelector('.bubble');
    expect(bubble).toHaveClass('bubble-signed');
  });

  it('should apply "bubble-signed-error" class when signature is invalid', () => {
    const invalidSignedMessage: MessageResponse = {
      ...baseMessage,
      signature: 'Invalid',
    };
    const { container } = render(<MessageBubble msg={invalidSignedMessage} me={false} />);
    const bubble = container.querySelector('.bubble');
    expect(bubble).toHaveClass('bubble-signed-error');
  });

  it('should render different messages correctly', () => {
    const message1 = { ...baseMessage, message: 'Hello World' };
    const { rerender } = render(<MessageBubble msg={message1} me={false} />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();

    const message2 = { ...baseMessage, message: 'Different message' };
    rerender(<MessageBubble msg={message2} me={false} />);
    expect(screen.getByText('Different message')).toBeInTheDocument();
  });

  it('should handle long messages', () => {
    const longMessage: MessageResponse = {
      ...baseMessage,
      message: 'This is a very long message that contains a lot of text to test how the component handles longer content',
    };
    render(<MessageBubble msg={longMessage} me={false} />);
    expect(screen.getByText(longMessage.message)).toBeInTheDocument();
  });
});
