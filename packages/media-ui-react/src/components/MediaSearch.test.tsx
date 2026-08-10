import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { MediaSearch } from './MediaSearch';
import React from 'react';

describe('MediaSearch', () => {
  it('renders the search input and button', () => {
    render(<MediaSearch />);

    expect(screen.getByLabelText('Search media')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /search/i })
    ).toBeInTheDocument();
  });

  it('renders photo, video and both options', () => {
    render(<MediaSearch />);

    expect(screen.getByLabelText('Photos')).toBeInTheDocument();
    expect(screen.getByLabelText('Videos')).toBeInTheDocument();
    expect(screen.getByLabelText(/both/i)).toBeInTheDocument();
  });

  it('defaults to photos', () => {
    render(<MediaSearch />);

    expect(screen.getByLabelText('Photos')).toBeChecked();
    expect(screen.getByLabelText('Videos')).not.toBeChecked();
  });

  it('uses the provided media type', () => {
    render(<MediaSearch type="video" />);

    expect(screen.getByLabelText('Videos')).toBeChecked();
    expect(screen.getByLabelText('Photos')).not.toBeChecked();
  });

  it('calls onTypeChange when videos are selected', () => {
    const onTypeChange = vi.fn();

    render(
      <MediaSearch
        type="photo"
        onTypeChange={onTypeChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Videos'));

    expect(onTypeChange).toHaveBeenCalledWith('video');
  });

  it('calls onSearch with the entered query', () => {
    const onSearch = vi.fn();

    render(<MediaSearch onSearch={onSearch} />);

    const input = screen.getByLabelText('Search media');

    fireEvent.change(input, {
      target: { value: 'nature' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /search/i })
    );

    expect(onSearch).toHaveBeenCalledWith('nature');
  });

  it('does not search an empty query', () => {
    const onSearch = vi.fn();

    render(<MediaSearch onSearch={onSearch} />);

    fireEvent.click(
      screen.getByRole('button', { name: /search/i })
    );

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('trims the search query', () => {
    const onSearch = vi.fn();

    render(<MediaSearch onSearch={onSearch} />);

    fireEvent.change(screen.getByLabelText('Search media'), {
      target: { value: '  nature  ' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /search/i })
    );

    expect(onSearch).toHaveBeenCalledWith('nature');
  });
});