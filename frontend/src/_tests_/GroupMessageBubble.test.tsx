import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GroupMessageBubble from '../components/chat/GroupMessageBubble';
import { MessageResponse } from '../types';

describe('GroupMessageBubble', () => {
  const baseMessage: MessageResponse = {
    sender: 'user1',
    receiver: 'group1',
    message: 'Test group message',
    hash: 'hash123',
    timestamp: '2025-01-29T10:30:00.000Z',
  };

  it('should render message text', () => {
    render(<GroupMessageBubble msg={baseMessage} me={false} />);
    expect(screen.getByText('Test group message')).toBeInTheDocument();
  });

  it('should display sender name when message is not from me', () => {
    render(<GroupMessageBubble msg={baseMessage} me={false} />);
    expect(screen.getByText('user1')).toBeInTheDocument();
  });

  it('should not display sender name when message is from me', () => {
    render(<GroupMessageBubble msg={baseMessage} me={true} />);
    expect(screen.queryByText('user1')).not.toBeInTheDocument();
  });

  it('should display formatted timestamp', () => {
    render(<GroupMessageBubble msg={baseMessage} me={false} />);
    const timeElement = screen.getByText(/\d{1,2}:\d{2}/);
    expect(timeElement).toBeInTheDocument();
  });

  it('should apply "right" class when message is from me', () => {
    const { container } = render(<GroupMessageBubble msg={baseMessage} me={true} />);
    const wrapper = container.querySelector('.bubble-wrapper');
    expect(wrapper).toHaveClass('right');
    expect(wrapper).not.toHaveClass('left');
  });

  it('should apply "left" class when message is from other user', () => {
    const { container } = render(<GroupMessageBubble msg={baseMessage} me={false} />);
    const wrapper = container.querySelector('.bubble-wrapper');
    expect(wrapper).toHaveClass('left');
    expect(wrapper).not.toHaveClass('right');
  });

  it('should apply "bubble-me" class for my messages', () => {
    const { container } = render(<GroupMessageBubble msg={baseMessage} me={true} />);
    const bubble = container.querySelector('.bubble');
    expect(bubble).toHaveClass('bubble-me');
    expect(bubble).not.toHaveClass('bubble-other');
  });

  it('should apply "bubble-other" class for other user messages', () => {
    const { container } = render(<GroupMessageBubble msg={baseMessage} me={false} />);
    const bubble = container.querySelector('.bubble');
    expect(bubble).toHaveClass('bubble-other');
    expect(bubble).not.toHaveClass('bubble-me');
  });

  it('should show signature icon when message is signed', () => {
    const signedMessage: MessageResponse = {
      ...baseMessage,
      signature: 'Signed',
    };
    render(<GroupMessageBubble msg={signedMessage} me={false} />);
    const icon = document.querySelector('.bubble-icon');
    expect(icon).toBeInTheDocument();
  });

  it('should not show signature icon when message is not signed', () => {
    render(<GroupMessageBubble msg={baseMessage} me={false} />);
    const icon = document.querySelector('.bubble-icon');
    expect(icon).not.toBeInTheDocument();
  });

  it('should apply "bubble-signed" class when signature is "Signed"', () => {
    const signedMessage: MessageResponse = {
      ...baseMessage,
      signature: 'Signed',
    };
    const { container } = render(<GroupMessageBubble msg={signedMessage} me={false} />);
    const bubble = container.querySelector('.bubble');
    expect(bubble).toHaveClass('bubble-signed');
  });

  it('should apply "bubble-signed-error" class when signature is invalid', () => {
    const invalidSignedMessage: MessageResponse = {
      ...baseMessage,
      signature: 'Invalid',
    };
    const { container } = render(<GroupMessageBubble msg={invalidSignedMessage} me={false} />);
    const bubble = container.querySelector('.bubble');
    expect(bubble).toHaveClass('bubble-signed-error');
  });

  it('should render different sender names correctly', () => {
    const message1 = { ...baseMessage, sender: 'Alice' };
    const { rerender } = render(<GroupMessageBubble msg={message1} me={false} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();

    const message2 = { ...baseMessage, sender: 'Bob' };
    rerender(<GroupMessageBubble msg={message2} me={false} />);
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('should handle long messages with sender name', () => {
    const longMessage: MessageResponse = {
      ...baseMessage,
      sender: 'VeryLongUsername123',
      message: 'This is a very long message that contains a lot of text to test how the component handles longer content in group chat',
    };
    render(<GroupMessageBubble msg={longMessage} me={false} />);
    expect(screen.getByText('VeryLongUsername123')).toBeInTheDocument();
    expect(screen.getByText(longMessage.message)).toBeInTheDocument();
  });

  it('should have correct heading styles for sender name', () => {
    render(<GroupMessageBubble msg={baseMessage} me={false} />);
    const senderHeading = screen.getByText('user1');

    expect(senderHeading.tagName).toBe('H4');
    expect(senderHeading).toHaveStyle({ marginBottom: '10px', fontWeight: '900' });
  });
});
