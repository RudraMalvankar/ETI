import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '../components/common/SearchBar';

describe('SearchBar', () => {
  it('renders with default placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Search assets, documents, incidents...')).toBeDefined();
  });

  it('renders with custom placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Custom placeholder" />);
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeDefined();
  });

  it('displays the current value', () => {
    render(<SearchBar value="test query" onChange={() => {}} />);
    expect(screen.getByDisplayValue('test query')).toBeDefined();
  });

  it('calls onChange when typing', () => {
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new text' } });
    expect(handleChange).toHaveBeenCalledWith('new text');
  });

  it('calls onSearch when Enter is pressed', () => {
    const handleSearch = vi.fn();
    render(<SearchBar value="query" onChange={() => {}} onSearch={handleSearch} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(handleSearch).toHaveBeenCalled();
  });

  it('does not call onSearch when other keys are pressed', () => {
    const handleSearch = vi.fn();
    render(<SearchBar value="query" onChange={() => {}} onSearch={handleSearch} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'a' });
    expect(handleSearch).not.toHaveBeenCalled();
  });

  it('shows clear button when value is present', () => {
    render(<SearchBar value="has text" onChange={() => {}} />);
    expect(screen.getByRole('button')).toBeDefined();
  });

  it('does not show clear button when value is empty', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('clears value when clear button is clicked', () => {
    const handleChange = vi.fn();
    render(<SearchBar value="to clear" onChange={handleChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleChange).toHaveBeenCalledWith('');
  });
});
