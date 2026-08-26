import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../components/common/StatusBadge';

describe('StatusBadge', () => {
  it('renders with status text', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('active')).toBeDefined();
  });

  it('renders with custom label', () => {
    render(<StatusBadge status="active" label="Custom Label" />);
    expect(screen.getByText('Custom Label')).toBeDefined();
  });

  it('applies green styles for nominal status', () => {
    const { container } = render(<StatusBadge status="nominal" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('emerald');
  });

  it('applies blue styles for active status', () => {
    const { container } = render(<StatusBadge status="active" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('blue');
  });

  it('applies amber styles for warning status', () => {
    const { container } = render(<StatusBadge status="warning" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('amber');
  });

  it('applies red styles for critical status', () => {
    const { container } = render(<StatusBadge status="critical" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('red');
  });

  it('applies red styles for failed status', () => {
    const { container } = render(<StatusBadge status="failed" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('red');
  });

  it('handles unknown status with default styles', () => {
    const { container } = render(<StatusBadge status="unknown_status" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('slate');
  });

  it('applies small size when size=sm', () => {
    const { container } = render(<StatusBadge status="active" size="sm" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('text-[10px]');
  });

  it('applies medium size by default', () => {
    const { container } = render(<StatusBadge status="active" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('text-xs');
  });
});
