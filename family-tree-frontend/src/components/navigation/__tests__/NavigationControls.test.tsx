import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NavigationControls } from '../NavigationControls';

describe('NavigationControls', () => {
  const mockProps = {
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onCenterTree: vi.fn(),
    onResetZoom: vi.fn(),
    currentZoom: 1.0,
    minZoom: 0.1,
    maxZoom: 2.0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all navigation buttons', () => {
    render(<NavigationControls {...mockProps} />);
    
    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
    expect(screen.getByLabelText('Center tree view')).toBeInTheDocument();
    expect(screen.getByLabelText('Reset zoom to 100%')).toBeInTheDocument();
  });

  it('displays current zoom percentage', () => {
    render(<NavigationControls {...mockProps} currentZoom={0.8} />);
    
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('calls onZoomIn when zoom in button is clicked', () => {
    render(<NavigationControls {...mockProps} />);
    
    fireEvent.click(screen.getByLabelText('Zoom in'));
    expect(mockProps.onZoomIn).toHaveBeenCalledTimes(1);
  });

  it('calls onZoomOut when zoom out button is clicked', () => {
    render(<NavigationControls {...mockProps} />);
    
    fireEvent.click(screen.getByLabelText('Zoom out'));
    expect(mockProps.onZoomOut).toHaveBeenCalledTimes(1);
  });

  it('calls onCenterTree when center button is clicked', () => {
    render(<NavigationControls {...mockProps} />);
    
    fireEvent.click(screen.getByLabelText('Center tree view'));
    expect(mockProps.onCenterTree).toHaveBeenCalledTimes(1);
  });

  it('calls onResetZoom when reset button is clicked', () => {
    render(<NavigationControls {...mockProps} />);
    
    fireEvent.click(screen.getByLabelText('Reset zoom to 100%'));
    expect(mockProps.onResetZoom).toHaveBeenCalledTimes(1);
  });

  it('disables zoom in button when at maximum zoom', () => {
    render(<NavigationControls {...mockProps} currentZoom={2.0} />);
    
    const zoomInButton = screen.getByLabelText('Zoom in');
    expect(zoomInButton).toBeDisabled();
  });

  it('disables zoom out button when at minimum zoom', () => {
    render(<NavigationControls {...mockProps} currentZoom={0.1} />);
    
    const zoomOutButton = screen.getByLabelText('Zoom out');
    expect(zoomOutButton).toBeDisabled();
  });

  it('enables both zoom buttons when zoom is in middle range', () => {
    render(<NavigationControls {...mockProps} currentZoom={1.0} />);
    
    const zoomInButton = screen.getByLabelText('Zoom in');
    const zoomOutButton = screen.getByLabelText('Zoom out');
    
    expect(zoomInButton).not.toBeDisabled();
    expect(zoomOutButton).not.toBeDisabled();
  });

  it('updates zoom percentage when currentZoom prop changes', () => {
    const { rerender } = render(<NavigationControls {...mockProps} currentZoom={1.0} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
    
    rerender(<NavigationControls {...mockProps} currentZoom={1.5} />);
    expect(screen.getByText('150%')).toBeInTheDocument();
  });
});