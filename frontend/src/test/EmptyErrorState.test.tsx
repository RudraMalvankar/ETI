import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

describe('EmptyState', () => {
  it('renders default title and description', () => {
    render(<EmptyState />);
    expect(screen.getByText('No Data Found')).toBeDefined();
    expect(screen.getByText('There are currently no items or records to display.')).toBeDefined();
  });

  it('renders custom title and description', () => {
    render(<EmptyState title="Custom Title" description="Custom description" />);
    expect(screen.getByText('Custom Title')).toBeDefined();
    expect(screen.getByText('Custom description')).toBeDefined();
  });

  it('renders action when provided', () => {
    render(<EmptyState action={<button>Action Button</button>} />);
    expect(screen.getByText('Action Button')).toBeDefined();
  });

  it('does not render action when not provided', () => {
    const { container } = render(<EmptyState />);
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(0);
  });
});

describe('ErrorState', () => {
  it('renders default title and message', () => {
    render(<ErrorState />);
    expect(screen.getByText('Service Unavailable')).toBeDefined();
    expect(screen.getByText('An unexpected error occurred while communicating with backend APIs.')).toBeDefined();
  });

  it('renders custom title and message', () => {
    render(<ErrorState title="Custom Error" message="Something went wrong" />);
    expect(screen.getByText('Custom Error')).toBeDefined();
    expect(screen.getByText('Something went wrong')).toBeDefined();
  });

  it('renders retry button when onRetry is provided', () => {
    const handleRetry = vi.fn();
    render(<ErrorState onRetry={handleRetry} />);
    const retryButton = screen.getByText('Retry Connection');
    expect(retryButton).toBeDefined();
    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalled();
  });

  it('does not render retry button when onRetry is not provided', () => {
    const { container } = render(<ErrorState />);
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(0);
  });
});
