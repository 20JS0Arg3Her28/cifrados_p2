import { render, screen } from '@testing-library/react';
import React from 'react';
import Toast from '../components/Toast/Toast';

describe('Toast', () => {
  it('renders message text', () => {
    render(<Toast message="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders close button when onClose is provided', () => {
    const fn = () => {};
    render(<Toast message="Hi" onClose={fn} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
