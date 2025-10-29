import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import RequestInterface from '../pages/Other/RequestInterface';
import { useAuth } from '../store/useAuth';
import api from '../lib/api';

// Mock dependencies
vi.mock('../store/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('../store/userStore', () => ({
  getUsername: vi.fn(() => 'test-user'),
}));

describe('RequestInterface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue('test-access-token');
  });

  it('should render with tabs', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [false, 'No transactions found'] });

    render(
      <BrowserRouter>
        <RequestInterface />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Verify Transactions')).toBeInTheDocument();
      expect(screen.getByText('Get Transactions')).toBeInTheDocument();
      expect(screen.getByText('Hash Group')).toBeInTheDocument();
      expect(screen.getByText('Hash P2P')).toBeInTheDocument();
    });
  });

  it('should fetch and display verify transactions by default', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [true, 'All transactions verified'] });

    render(
      <BrowserRouter>
        <RequestInterface />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/verify-transactions');
      expect(screen.getByText('All transactions verified')).toBeInTheDocument();
    });
  });

  it('should display "No transactions found" when there are none', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [false, ''] });

    render(
      <BrowserRouter>
        <RequestInterface />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No transactions found.')).toBeInTheDocument();
    });
  });

  it('should switch to transactions tab and fetch transactions', async () => {
    const mockTransactions = [
      {
        id: 1,
        hash: 'hash1',
        previous_hash: 'prev1',
        timestamp: '2025-01-01T10:00:00Z',
        messages: [
          { is_p2p: true, message_id: 1, message: 'Hello', message_hash: 'msg_hash1' },
        ],
      },
    ];

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [true, 'Verified'] })
      .mockResolvedValueOnce({ data: mockTransactions });

    render(
      <BrowserRouter>
        <RequestInterface />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Get Transactions')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Get Transactions'));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/transactions');
      expect(screen.getByText('Transactions')).toBeInTheDocument();
      expect(screen.getByText('Block #1')).toBeInTheDocument();
      expect(screen.getByText('hash1')).toBeInTheDocument();
      expect(screen.getByText('prev1')).toBeInTheDocument();
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  it('should display "No transactions found" in transactions tab when empty', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [true, 'Verified'] })
      .mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <RequestInterface />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Get Transactions'));

    await waitFor(() => {
      expect(screen.getByText('No transactions found.')).toBeInTheDocument();
    });
  });

  it('should render multiple messages in a transaction', async () => {
    const mockTransactions = [
      {
        id: 1,
        hash: 'hash1',
        previous_hash: 'prev1',
        timestamp: '2025-01-01T10:00:00Z',
        messages: [
          { is_p2p: true, message_id: 1, message: 'Hello', message_hash: 'msg_hash1' },
          { is_p2p: false, message_id: 2, message: 'World', message_hash: 'msg_hash2' },
        ],
      },
    ];

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [true, 'Verified'] })
      .mockResolvedValueOnce({ data: mockTransactions });

    render(
      <BrowserRouter>
        <RequestInterface />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Get Transactions'));

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('World')).toBeInTheDocument();
      expect(screen.getByText('msg_hash1')).toBeInTheDocument();
      expect(screen.getByText('msg_hash2')).toBeInTheDocument();
    });
  });

  it('should switch to hash-group tab and fetch groups', async () => {
    const mockGroups = ['group1', 'group2', 'group3'];

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [true, 'Verified'] })
      .mockResolvedValueOnce({ data: mockGroups });

    render(
      <BrowserRouter>
        <RequestInterface />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Hash Group'));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/groups/all');
      expect(screen.getByText('Selecciona grupo')).toBeInTheDocument();
      expect(screen.getByText('group1')).toBeInTheDocument();
      expect(screen.getByText('group2')).toBeInTheDocument();
      expect(screen.getByText('group3')).toBeInTheDocument();
    });
  });

  it('should verify group hash when group is selected and verified', async () => {
    const mockGroups = ['group1'];

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [true, 'Verified'] })
      .mockResolvedValueOnce({ data: mockGroups })
      .mockResolvedValueOnce({ data: [true, 'Hashes verified for 5 items.'] });

    render(
      <BrowserRouter>
        <RequestInterface />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Hash Group'));

    await waitFor(() => {
      expect(screen.getByText('group1')).toBeInTheDocument();
    });

    const select = screen.getByDisplayValue('Selecciona grupo');
    fireEvent.change(select, { target: { value: 'group1' } });

    const verifyButton = screen.getAllByText('Verificar')[0];
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/group-messages/group1/verify-hash');
      expect(screen.getByText('Hashes verified for 5 items.')).toBeInTheDocument();
    });
  });

  it('should handle error when fetching groups fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [true, 'Verified'] })
      .mockRejectedValueOnce(new Error('Fetch failed'));

    render(
      <BrowserRouter>
        <RequestInterface />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Hash Group'));

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Error getting groups:', expect.any(Error));
    });

    consoleError.mockRestore();
  });

  it('should switch to hash-p2p tab and fetch users', async () => {
    const mockUsers = ['user1@test.com', 'user2@test.com', 'user3@test.com'];

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [true, 'Verified'] })
      .mockResolvedValueOnce({ data: mockUsers });

    render(
      <BrowserRouter>
        <RequestInterface />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Hash P2P'));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/users/all');
      expect(screen.getByText('Selecciona usuario 1')).toBeInTheDocument();
      expect(screen.getByText('Selecciona usuario 2')).toBeInTheDocument();
      const userElements = screen.getAllByText('user1@test.com');
      expect(userElements.length).toBeGreaterThan(0);
    });
  });

  it('should verify p2p hash when both users are selected', async () => {
    const mockUsers = ['user1@test.com', 'user2@test.com'];

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [true, 'Verified'] })
      .mockResolvedValueOnce({ data: mockUsers })
      .mockResolvedValueOnce({ data: [true, 'Hashes verified for 10 items.'] });

    render(
      <BrowserRouter>
        <RequestInterface />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Hash P2P'));

    await waitFor(() => {
      const userElements = screen.getAllByText('user1@test.com');
      expect(userElements.length).toBeGreaterThan(0);
    });

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'user1@test.com' } });
    fireEvent.change(selects[1], { target: { value: 'user2@test.com' } });

    const verifyButton = screen.getAllByText('Verificar')[0];
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/messages/user1@test.com/user2@test.com/verify-hash');
      expect(screen.getByText('Hashes verified for 10 items.')).toBeInTheDocument();
    });
  });

  it('should handle error when fetching users fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [true, 'Verified'] })
      .mockRejectedValueOnce(new Error('Fetch failed'));

    render(
      <BrowserRouter>
        <RequestInterface />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Hash P2P'));

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Error getting users:', expect.any(Error));
    });

    consoleError.mockRestore();
  });

  it('should handle error when verifying transactions fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(api.get).mockRejectedValue(new Error('Verify failed'));

    render(
      <BrowserRouter>
        <RequestInterface />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Error fetching transactions:', expect.any(Error));
    });

    consoleError.mockRestore();
  });

  it('should handle error when fetching transactions fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [true, 'Verified'] })
      .mockRejectedValueOnce(new Error('Fetch failed'));

    render(
      <BrowserRouter>
        <RequestInterface />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Get Transactions'));

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Error fetching verify-transactions:', expect.any(Error));
    });

    consoleError.mockRestore();
  });

  it('should handle error when verifying group hash fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockGroups = ['group1'];

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [true, 'Verified'] })
      .mockResolvedValueOnce({ data: mockGroups })
      .mockRejectedValueOnce(new Error('Verify failed'));

    render(
      <BrowserRouter>
        <RequestInterface />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Hash Group'));

    await waitFor(() => {
      expect(screen.getByText('group1')).toBeInTheDocument();
    });

    const select = screen.getByDisplayValue('Selecciona grupo');
    fireEvent.change(select, { target: { value: 'group1' } });

    const verifyButton = screen.getAllByText('Verificar')[0];
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Error fetching transactions:', expect.any(Error));
    });

    consoleError.mockRestore();
  });

  it('should handle error when verifying p2p hash fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockUsers = ['user1@test.com', 'user2@test.com'];

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [true, 'Verified'] })
      .mockResolvedValueOnce({ data: mockUsers })
      .mockRejectedValueOnce(new Error('Verify failed'));

    render(
      <BrowserRouter>
        <RequestInterface />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Hash P2P'));

    await waitFor(() => {
      const userElements = screen.getAllByText('user1@test.com');
      expect(userElements.length).toBeGreaterThan(0);
    });

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'user1@test.com' } });
    fireEvent.change(selects[1], { target: { value: 'user2@test.com' } });

    const verifyButton = screen.getAllByText('Verificar')[0];
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Error fetching transactions:', expect.any(Error));
    });

    consoleError.mockRestore();
  });

  it('should switch between tabs correctly', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [true, 'Verified'] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <RequestInterface />
      </BrowserRouter>
    );

    // Default is transactions-verify
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/verify-transactions');
    });

    // Switch to transactions
    fireEvent.click(screen.getByText('Get Transactions'));
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/transactions');
    });

    // Switch to hash-group
    fireEvent.click(screen.getByText('Hash Group'));
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/groups/all');
    });

    // Switch to hash-p2p
    fireEvent.click(screen.getByText('Hash P2P'));
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/users/all');
    });
  });
});
