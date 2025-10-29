import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import GroupChatPage from '../pages/Chat/GroupChatPage';
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
}));

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('react-icons/hi', () => ({
  HiUsers: () => <span>HiUsers</span>,
  HiOutlineUsers: () => <span>HiOutlineUsers</span>,
}));

vi.mock('../components/chat/GroupMessageBubble', () => ({
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

describe('GroupChatPage', () => {
  const mockSetMessages = vi.fn();
  const mockMessages = [
    { sender: 'test-user', message: 'Hello group', timestamp: '2025-01-01T10:00:00' },
    { sender: 'user2', message: 'Hi there', timestamp: '2025-01-01T10:01:00' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();
    (useAuth as any).mockReturnValue('test-access-token');
    (useChatStore as any).mockImplementation((selector: any) => {
      const state = {
        messages: mockMessages,
        setMessages: mockSetMessages,
      };
      return selector(state);
    });
    vi.mocked(userStore.getUsername).mockReturnValue('test-user');
  });

  it('should render group chat interface', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <GroupChatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('+ Crear Grupo')).toBeInTheDocument();
      expect(screen.getByText('Grupos')).toBeInTheDocument();
    });
  });

  it('should display "no groups" message when contacts are empty', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <GroupChatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No hay grupos disponibles')).toBeInTheDocument();
    });
  });

  it('should fetch and display groups', async () => {
    const mockGroups = [{ id: 'group1' }, { id: 'group2' }];
    vi.mocked(api.get).mockResolvedValue({ data: mockGroups });

    render(
      <BrowserRouter>
        <GroupChatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/users/test-user/groups', {
        headers: { Authorization: 'Bearer test-access-token' },
      });
      expect(screen.getByText('group1')).toBeInTheDocument();
      expect(screen.getByText('group2')).toBeInTheDocument();
    });
  });

  it('should open modal when create group button is clicked', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <GroupChatPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('+ Crear Grupo'));

    await waitFor(() => {
      expect(screen.getByText('Nuevo Grupo')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Nombre del grupo')).toBeInTheDocument();
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
      expect(screen.getByText('Crear')).toBeInTheDocument();
    });
  });

  it('should close modal when cancel is clicked', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <GroupChatPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('+ Crear Grupo'));

    await waitFor(() => {
      expect(screen.getByText('Nuevo Grupo')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancelar'));

    await waitFor(() => {
      expect(screen.queryByText('Nuevo Grupo')).not.toBeInTheDocument();
    });
  });

  it('should create a new group successfully', async () => {
    const mockGroups = [{ id: 'new-group' }];
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: mockGroups })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    vi.mocked(api.post)
      .mockResolvedValueOnce({ data: 'new-group' })
      .mockResolvedValueOnce({ data: {} });

    render(
      <BrowserRouter>
        <GroupChatPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('+ Crear Grupo'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre del grupo')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Nombre del grupo'), {
      target: { value: 'new-group' },
    });

    fireEvent.click(screen.getByText('Crear'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/group-messages/create',
        { name: 'new-group' },
        { headers: { Authorization: 'Bearer test-access-token' } }
      );
      expect(api.post).toHaveBeenCalledWith(
        '/group-messages/new-group/add',
        { name: 'test-user' },
        { headers: { Authorization: 'Bearer test-access-token' } }
      );
      expect(screen.queryByText('Nuevo Grupo')).not.toBeInTheDocument();
    });
  });

  it('should show alert when group creation fails', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    vi.mocked(api.post).mockRejectedValue(new Error('Group exists'));

    render(
      <BrowserRouter>
        <GroupChatPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('+ Crear Grupo'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre del grupo')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Nombre del grupo'), {
      target: { value: 'existing-group' },
    });

    fireEvent.click(screen.getByText('Crear'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error creating group: Group name already in use.');
    });
  });

  it('should fetch messages when a group is selected', async () => {
    const mockGroups = [{ id: 'group1' }];
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: mockGroups })
      .mockResolvedValueOnce({ data: 'test-user' })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: mockMessages });

    render(
      <BrowserRouter>
        <GroupChatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('group1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('group1'));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/group-messages/group1', {
        headers: { Authorization: 'Bearer test-access-token' },
      });
      expect(mockSetMessages).toHaveBeenCalledWith(mockMessages);
    });
  });

  it('should display messages when a group is active', async () => {
    const mockGroups = [{ id: 'group1' }];
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: mockGroups })
      .mockResolvedValueOnce({ data: 'test-user' })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: mockMessages });

    render(
      <BrowserRouter>
        <GroupChatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('group1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('group1'));

    await waitFor(() => {
      expect(screen.getByTestId('message-2025-01-01T10:00:00')).toBeInTheDocument();
      expect(screen.getByTestId('message-2025-01-01T10:01:00')).toBeInTheDocument();
    });
  });

  it('should send message to group', async () => {
    const mockGroups = [{ id: 'group1' }];
    const newMessages = [
      ...mockMessages,
      { sender: 'test-user', message: 'New message', timestamp: '2025-01-01T10:02:00' },
    ];

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: mockGroups })
      .mockResolvedValueOnce({ data: 'test-user' })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: mockMessages })
      .mockResolvedValueOnce({ data: newMessages });

    vi.mocked(api.post).mockResolvedValue({ data: {} });

    render(
      <BrowserRouter>
        <GroupChatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('group1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('group1'));

    await waitFor(() => {
      expect(screen.getByTestId('message-input')).toBeInTheDocument();
    });

    const input = screen.getByTestId('message-input');
    fireEvent.keyDown(input, { key: 'Enter', target: { value: 'New message' } });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/group-messages/group1',
        { message: 'New message', signed: false },
        { headers: { Authorization: 'Bearer test-access-token' } }
      );
      expect(mockSetMessages).toHaveBeenCalledWith(newMessages);
    });
  });

  it('should verify ownership when group is selected', async () => {
    const mockGroups = [{ id: 'group1' }];
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: mockGroups })
      .mockResolvedValueOnce({ data: 'test-user' })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <GroupChatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('group1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('group1'));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/group-messages/group1/owner', {
        headers: { Authorization: 'Bearer test-access-token' },
      });
    });
  });

  it('should show add user interface when user is owner', async () => {
    const mockGroups = [{ id: 'group1' }];
    const mockAvailableUsers = [{ email: 'user1@test.com' }, { email: 'user2@test.com' }];

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: mockGroups })
      .mockResolvedValueOnce({ data: 'test-user' })
      .mockResolvedValueOnce({ data: mockAvailableUsers })
      .mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <GroupChatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('group1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('group1'));

    await waitFor(() => {
      expect(screen.getByText('-- Selecciona usuario para agregar --')).toBeInTheDocument();
      expect(screen.getByText('Agregar al grupo')).toBeInTheDocument();
    });
  });

  it('should add user to group successfully', async () => {
    const mockGroups = [{ id: 'group1' }];
    const mockAvailableUsers = [{ email: 'user1@test.com' }];

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: mockGroups })
      .mockResolvedValueOnce({ data: 'test-user' })
      .mockResolvedValueOnce({ data: mockAvailableUsers })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    vi.mocked(api.post).mockResolvedValue({ data: {} });

    render(
      <BrowserRouter>
        <GroupChatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('group1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('group1'));

    await waitFor(() => {
      expect(screen.getByText('user1@test.com')).toBeInTheDocument();
    });

    const select = screen.getByDisplayValue('-- Selecciona usuario para agregar --');
    fireEvent.change(select, { target: { value: 'user1@test.com' } });

    fireEvent.click(screen.getByText('Agregar al grupo'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/group-messages/group1/add',
        { name: 'user1@test.com' },
        { headers: { Authorization: 'Bearer test-access-token' } }
      );
      expect(window.alert).toHaveBeenCalledWith('✅ user1@test.com agregado al grupo');
    });
  });

  it('should show error when adding user fails', async () => {
    const mockGroups = [{ id: 'group1' }];
    const mockAvailableUsers = [{ email: 'user1@test.com' }];

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: mockGroups })
      .mockResolvedValueOnce({ data: 'test-user' })
      .mockResolvedValueOnce({ data: mockAvailableUsers })
      .mockResolvedValueOnce({ data: [] });

    vi.mocked(api.post).mockRejectedValue(new Error('User add failed'));

    render(
      <BrowserRouter>
        <GroupChatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('group1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('group1'));

    await waitFor(() => {
      expect(screen.getByText('user1@test.com')).toBeInTheDocument();
    });

    const select = screen.getByDisplayValue('-- Selecciona usuario para agregar --');
    fireEvent.change(select, { target: { value: 'user1@test.com' } });

    fireEvent.click(screen.getByText('Agregar al grupo'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('No se pudo agregar el usuario');
    });
  });

  it('should not fetch groups if username is empty', () => {
    vi.mocked(userStore.getUsername).mockReturnValue('');
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <GroupChatPage />
      </BrowserRouter>
    );

    expect(api.get).not.toHaveBeenCalledWith(
      expect.stringContaining('/groups'),
      expect.any(Object)
    );
  });
});
