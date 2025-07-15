import { useState, useEffect } from 'react';
import './NavigationControls.css';

interface NavigationControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterTree: () => void;
  onResetZoom: () => void;
  currentZoom: number;
  minZoom?: number;
  maxZoom?: number;
}

export function NavigationControls({
  onZoomIn,
  onZoomOut,
  onCenterTree,
  onResetZoom,
  currentZoom,
  minZoom = 0.1,
  maxZoom = 2.0
}: NavigationControlsProps) {
  const [zoomPercentage, setZoomPercentage] = useState(Math.round(currentZoom * 100));

  useEffect(() => {
    setZoomPercentage(Math.round(currentZoom * 100));
  }, [currentZoom]);

  const canZoomIn = currentZoom < maxZoom;
  const canZoomOut = currentZoom > minZoom;

  return (
    <div className="navigation-controls">
      <div className="control-group">
        <button
          className="nav-button zoom-out"
          onClick={onZoomOut}
          disabled={!canZoomOut}
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13H5v-2h14v2z"/>
          </svg>
        </button>
        
        <div className="zoom-display" title={`Current zoom: ${zoomPercentage}%`}>
          {zoomPercentage}%
        </div>
        
        <button
          className="nav-button zoom-in"
          onClick={onZoomIn}
          disabled={!canZoomIn}
          title="Zoom In"
          aria-label="Zoom in"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
      </div>

      <div className="control-group">
        <button
          className="nav-button center-tree"
          onClick={onCenterTree}
          title="Center Tree"
          aria-label="Center tree view"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
            <path d="M12 16l-6-6 1.41-1.41L12 13.17l4.59-4.58L18 10z"/>
          </svg>
        </button>
        
        <button
          className="nav-button reset-zoom"
          onClick={onResetZoom}
          title="Reset Zoom (100%)"
          aria-label="Reset zoom to 100%"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}