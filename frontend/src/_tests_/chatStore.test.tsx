import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from '../store/chatStore';
import { MessageResponse } from '../types';

describe('chatStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useChatStore.setState({ messages: [] });
  });

  it('should initialize with empty messages array', () => {
    const { messages } = useChatStore.getState();
    expect(messages).toEqual([]);
  });

  it('should set messages correctly', () => {
    const testMessages: MessageResponse[] = [
      {
        sender: 'user1',
        receiver: 'user2',
        message: 'Hello',
        hash: 'hash1',
        timestamp: '2025-01-01T10:00:00.000Z',
      },
      {
        sender: 'user2',
        receiver: 'user1',
        message: 'Hi',
        hash: 'hash2',
        timestamp: '2025-01-01T10:01:00.000Z',
      },
    ];

    const { setMessages } = useChatStore.getState();
    setMessages(testMessages);

    const { messages } = useChatStore.getState();
    expect(messages).toEqual(testMessages);
    expect(messages).toHaveLength(2);
  });

  it('should replace existing messages when setting new ones', () => {
    const initialMessages: MessageResponse[] = [
      {
        sender: 'user1',
        receiver: 'user2',
        message: 'First',
        hash: 'hash1',
        timestamp: '2025-01-01T10:00:00.000Z',
      },
    ];

    const newMessages: MessageResponse[] = [
      {
        sender: 'user3',
        receiver: 'user4',
        message: 'Second',
        hash: 'hash2',
        timestamp: '2025-01-01T10:02:00.000Z',
      },
    ];

    const { setMessages } = useChatStore.getState();

    setMessages(initialMessages);
    expect(useChatStore.getState().messages).toHaveLength(1);

    setMessages(newMessages);
    expect(useChatStore.getState().messages).toHaveLength(1);
    expect(useChatStore.getState().messages[0].message).toBe('Second');
  });

  it('should handle messages with signatures', () => {
    const signedMessage: MessageResponse[] = [
      {
        sender: 'user1',
        receiver: 'user2',
        message: 'Signed message',
        signature: 'Signed',
        hash: 'hash1',
        timestamp: '2025-01-01T10:00:00.000Z',
      },
    ];

    const { setMessages } = useChatStore.getState();
    setMessages(signedMessage);

    const { messages } = useChatStore.getState();
    expect(messages[0].signature).toBe('Signed');
  });

  it('should clear messages when setting empty array', () => {
    const testMessages: MessageResponse[] = [
      {
        sender: 'user1',
        receiver: 'user2',
        message: 'Hello',
        hash: 'hash1',
        timestamp: '2025-01-01T10:00:00.000Z',
      },
    ];

    const { setMessages } = useChatStore.getState();
    setMessages(testMessages);
    expect(useChatStore.getState().messages).toHaveLength(1);

    setMessages([]);
    expect(useChatStore.getState().messages).toHaveLength(0);
  });
});
