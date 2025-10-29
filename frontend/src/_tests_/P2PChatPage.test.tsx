import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ChatPage from '../pages/Chat/P2PChatPage';
import { useAuth } from '../store/useAuth';
import { useChatStore } from '../store/chatStore';
import * as userStore from '../store/userStore';
import api from '../lib/api';

// Mock dependencies
vi.mock('../store/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../store/chatStore', () => ({
  useChatStore: vi.fn(),
}));

vi.mock('../store/userStore', () => ({
  getUsername: vi.fn(() => 'test-user'),
  getPublicKey: vi.fn(() => 'test-public-key'),
  loadUsername: vi.fn(),
  loadPublicKey: vi.fn(),
}));

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../components/layout/Sidebar', () => ({
  default: ({ contacts, username, active, onSelect }: any) => (
    <div data-testid="sidebar">
      <div>Username: {username}</div>
      {contacts.map((contact: any) => (
        <div key={contact.id} onClick={() => onSelect(contact.id)} data-testid={`contact-${contact.id}`}>
          {contact.id}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../components/chat/MessageBubble', () => ({
  default: ({ msg, me }: any) => (
    <div data-testid={`message-${msg.timestamp}`}>
      <span>{msg.sender}: {msg.message}</span>
      <span>{me ? ' (me)' : ''}</span>
    </div>
  ),
}));

vi.mock('../components/chat/SignToggle', () => ({
  default: ({ enabled, onToggle }: any) => (
    <button onClick={() => onToggle(!enabled)} data-testid="sign-toggle">
      Sign: {enabled ? 'ON' : 'OFF'}
    </button>
  ),
}));

vi.mock('../components/chat/MessageInput', () => ({
  default: ({ onSend }: any) => (
    <input
      data-testid="message-input"
      placeholder="Type a message"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSend(e.currentTarget.value);
          e.currentTarget.value = '';
        }
      }}
    />
  ),
}));

describe('P2PChatPage', () => {
  const mockSetMessages = vi.fn();
  const mockMessages = [
    { sender: 'test-user', message: 'Hello', timestamp: '2025-01-01T10:00:00' },
    { sender: 'contact1', message: 'Hi there', timestamp: '2025-01-01T10:01:00' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue('test-access-token');
    (useChatStore as any).mockImplementation((selector: any) => {
      const state = {
        messages: mockMessages,
        setMessages: mockSetMessages,
      };
      return selector(state);
    });
    vi.mocked(userStore.getUsername).mockReturnValue('test-user');
    vi.mocked(userStore.getPublicKey).mockReturnValue('test-public-key');
  });

  it('should render chat interface with sidebar', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <ChatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByText('Selecciona un contacto')).toBeInTheDocument();
    });
  });

  it('should load username and public key if not set', async () => {
    // Mock getUsername to return empty string consistently
    vi.mocked(userStore.getUsername).mockReturnValue('');
    vi.mocked(userStore.getPublicKey).mockReturnValue('');
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <ChatPage />
      </BrowserRouter>
    );

    // Just verify the component renders without errors when username is empty
    await waitFor(() => {
      expect(screen.getByText('Selecciona un contacto')).toBeInTheDocument();
    });

    // Verify that load functions were called
    expect(userStore.loadUsername).toHaveBeenCalled();
    expect(userStore.loadPublicKey).toHaveBeenCalled();
  });

  it('should fetch and display contacts', async () => {
    const mockContacts = [{ id: 'contact1' }, { id: 'contact2' }];
    vi.mocked(api.get).mockResolvedValue({ data: mockContacts });

    render(
      <BrowserRouter>
        <ChatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/users', {
        headers: { Authorization: 'Bearer test-access-token' },
      });
      expect(screen.getByTestId('contact-contact1')).toBeInTheDocument();
      expect(screen.getByTestId('contact-contact2')).toBeInTheDocument();
    });
  });

  it('should handle error when fetching users fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <ChatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Error fetching users:', expect.any(Error));
    });

    consoleError.mockRestore();
  });

  it('should fetch messages when a contact is selected', async () => {
    const mockContacts = [{ id: 'contact1' }];
    const mockChatMessages = [
      { sender: 'test-user', message: 'Hi', timestamp: '2025-01-01T10:00:00' },
    ];

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: mockContacts })
      .mockResolvedValueOnce({ data: mockChatMessages });

    render(
      <BrowserRouter>
        <ChatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('contact-contact1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('contact-contact1'));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/messages/test-user/contact1', {
        headers: { Authorization: 'Bearer test-access-token' },
      });
      expect(mockSetMessages).toHaveBeenCalledWith(mockChatMessages);
    });
  });

  it('should display messages when a contact is active', async () => {
    const mockContacts = [{ id: 'contact1' }];
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: mockContacts })
      .mockResolvedValueOnce({ data: mockMessages });

    render(
      <BrowserRouter>
        <ChatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('contact-contact1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('contact-contact1'));

    await waitFor(() => {
      const contactElements = screen.getAllByText('contact1');
      expect(contactElements.length).toBeGreaterThan(0);
      expect(screen.getByTestId('message-2025-01-01T10:00:00')).toBeInTheDocument();
      expect(screen.getByTestId('message-2025-01-01T10:01:00')).toBeInTheDocument();
    });
  });

  it('should send message when input is submitted', async () => {
    const mockContacts = [{ id: 'contact1' }];
    const newMessages = [
      ...mockMessages,
      { sender: 'test-user', message: 'New message', timestamp: '2025-01-01T10:02:00' },
    ];

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: mockContacts })
      .mockResolvedValueOnce({ data: mockMessages })
      .mockResolvedValueOnce({ data: newMessages });

    vi.mocked(api.post).mockResolvedValue({ data: {} });

    render(
      <BrowserRouter>
        <ChatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('contact-contact1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('contact-contact1'));

    await waitFor(() => {
      expect(screen.getByTestId('message-input')).toBeInTheDocument();
    });

    const input = screen.getByTestId('message-input');
    fireEvent.keyDown(input, { key: 'Enter', target: { value: 'New message' } });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/messages/contact1',
        { message: 'New message', signed: false },
        { headers: { Authorization: 'Bearer test-access-token' } }
      );
      expect(mockSetMessages).toHaveBeenCalledWith(newMessages);
    });
  });

  it('should send signed message when sign toggle is on', async () => {
    const mockContacts = [{ id: 'contact1' }];

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: mockContacts })
      .mockResolvedValueOnce({ data: mockMessages })
      .mockResolvedValueOnce({ data: mockMessages });

    vi.mocked(api.post).mockResolvedValue({ data: {} });

    render(
      <BrowserRouter>
        <ChatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('contact-contact1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('contact-contact1'));

    await waitFor(() => {
      expect(screen.getByTestId('sign-toggle')).toBeInTheDocument();
    });

    // Toggle sign on
    fireEvent.click(screen.getByTestId('sign-toggle'));

    const input = screen.getByTestId('message-input');
    fireEvent.keyDown(input, { key: 'Enter', target: { value: 'Signed message' } });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/messages/contact1',
        { message: 'Signed message', signed: true },
        { headers: { Authorization: 'Bearer test-access-token' } }
      );
    });
  });

  it('should handle error when sending message fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockContacts = [{ id: 'contact1' }];

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: mockContacts })
      .mockResolvedValueOnce({ data: mockMessages });

    vi.mocked(api.post).mockRejectedValue(new Error('Send failed'));

    render(
      <BrowserRouter>
        <ChatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('contact-contact1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('contact-contact1'));

    await waitFor(() => {
      expect(screen.getByTestId('message-input')).toBeInTheDocument();
    });

    const input = screen.getByTestId('message-input');
    fireEvent.keyDown(input, { key: 'Enter', target: { value: 'Failed message' } });

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Error sending message:', expect.any(Error));
    });

    consoleError.mockRestore();
  });

  it('should handle error when fetching messages fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockContacts = [{ id: 'contact1' }];

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: mockContacts })
      .mockRejectedValueOnce(new Error('Fetch failed'));

    render(
      <BrowserRouter>
        <ChatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('contact-contact1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('contact-contact1'));

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Error fetching messages:', expect.any(Error));
    });

    consoleError.mockRestore();
  });

  it('should not fetch messages if no contact is selected', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <ChatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Selecciona un contacto')).toBeInTheDocument();
    });

    // Should only call get for users, not for messages
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith('/users', expect.any(Object));
  });
});
