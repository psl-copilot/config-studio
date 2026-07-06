import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loader from './Loader';

describe('Loader', () => {
  it('should render without crashing', () => {
    const { container } = render(<Loader />);
    expect(container).toBeDefined();
  });

  it('should display "Processing..." text', () => {
    render(<Loader />);
    expect(screen.getByText('Processing...')).toBeDefined();
  });

  it('should have a spinning element', () => {
    const { container } = render(<Loader />);
    const spinElement = container.querySelector('.animate-spin');
    expect(spinElement).toBeDefined();
  });

  it('should have fixed positioning', () => {
    const { container } = render(<Loader />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('fixed');
    expect(wrapper.className).toContain('inset-0');
  });

  it('should have z-50 for stacking context', () => {
    const { container } = render(<Loader />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('z-50');
  });

  it('should have semi-transparent white background', () => {
    const { container } = render(<Loader />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('bg-white');
    expect(wrapper.className).toContain('bg-opacity-60');
  });
});
