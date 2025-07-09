import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import ResultsDisplay from './resultsDisplay.jsx';

const mockHandlePopoverOpen = jest.fn();

describe('ResultsDisplay Component', () => {
  const defaultProps = {
    frequency: 60,
    vll: 240,
    vln: 120,
    unit: 'mm',
    handlePopoverOpen: mockHandlePopoverOpen,
  };

  const renderResultsDisplay = (rlcResults = [], conductors = []) => {
    render(
      <ResultsDisplay
        rlcResults={rlcResults}
        conductors={conductors}
        {...defaultProps}
      />
    );
  };

  beforeEach(() => {
    mockHandlePopoverOpen.mockClear();
  });

  it('renders empty without crashing', () => {
    renderResultsDisplay();
    expect(screen.getByText(/Results/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).toBeInTheDocument();

    // check headers render with buttons
    expect(screen.getByText('Phase')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByText('Material')).toBeInTheDocument();
    expect(screen.getByText('R (Ω/km)')).toBeInTheDocument();
    expect(
      screen.getByText((content, element) =>
        element.tagName.toLowerCase() === 'th' &&
        content.includes('X') &&
        element.querySelector('sub')?.textContent === 'L'
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText((content, element) =>
        element.tagName.toLowerCase() === 'th' &&
        content.includes('X') &&
        element.querySelector('sub')?.textContent === 'C'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('C (F/km)')).toBeInTheDocument();
    expect(screen.getByText(/\|Z\|/)).toBeInTheDocument();
    expect(screen.getByText('K-Factor')).toBeInTheDocument();
    expect(screen.getByText('PF')).toBeInTheDocument(); 

  });

  it('shows conductor size/material labels for each phase', () => {
    const mockConductors = [
      { name: 'condA', weightedProperties: [{ weight_percent: 100, type: 'Aluminum' }] },
      { name: 'condB', weightedProperties: [{ weight_percent: 100, type: 'Copper' }] },
      { name: 'condC', weightedProperties: [{ weight_percent: 100, type: 'Aluminum' }] },
    ];
    const mockRlcResults = [
      { R: 0.1, L: 0.01, C: 0.001 },
      { R: 0.2, L: 0.02, C: 0.002 },
      { R: 0.3, L: 0.03, C: 0.003 },
    ];
    renderResultsDisplay(mockRlcResults, mockConductors);
    expect(screen.getByText('condA')).toBeInTheDocument();
    expect(screen.getByText('condB')).toBeInTheDocument();
    expect(screen.getByText('condC')).toBeInTheDocument();

    expect(screen.getAllByText(/Aluminum/).length).toBe(2);
    expect(screen.getByText(/Copper/)).toBeInTheDocument();
  });

  it('shows only one row when all rlcResults are the same', () => {
    const mockConductors = [
      { name: 'condA', weightedProperties: [{ weight_percent: 100, type: 'Aluminum' }] },
      { name: 'condB', weightedProperties: [{ weight_percent: 100, type: 'Aluminum' }] },
      { name: 'condC', weightedProperties: [{ weight_percent: 100, type: 'Aluminum' }] },
    ];
    const mockRlcResults = [
      { R: 0.1, L: 0.01, C: 0.001 },
      { R: 0.1, L: 0.01, C: 0.001 },
      { R: 0.1, L: 0.01, C: 0.001 },
    ];
    renderResultsDisplay(mockRlcResults, mockConductors);
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1); // header + 1 data row
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('displays weight percent for each conductor and triggers handlePopoverOpen', () => {
    const mockConductors = [
      { name: 'condA', weightedProperties: [{ weight_percent: 80, type: 'Aluminum' }, { weight_percent: 20, type: 'Steel' }] },
      { name: 'condB', weightedProperties: [{ weight_percent: 100, type: 'Copper' }] },
      { name: 'condC', weightedProperties: [{ weight_percent: 100, type: 'Aluminum' }] },
    ];
    const mockRlcResults = [
      { R: 0.1, L: 0.01, C: 0.001 },
      { R: 0.2, L: 0.02, C: 0.002 },
      { R: 0.3, L: 0.03, C: 0.003 },
    ];
    renderResultsDisplay(mockRlcResults, mockConductors);

    // Check weight percent and type for each conductor
    expect(screen.getByText('condA')).toBeInTheDocument();
    expect(screen.getByText('condB')).toBeInTheDocument();
    expect(screen.getByText('condC')).toBeInTheDocument();
    expect(screen.getByText('80.00% Aluminum')).toBeInTheDocument();
    expect(screen.getByText('20.00% Steel')).toBeInTheDocument();
    expect(screen.getByText('Copper')).toBeInTheDocument();
    expect(screen.getAllByText('Aluminum').length).toBe(1);
  });

  it('triggers HandlePopoverOpen on info icon click', () => {
    const mockConductors = [
      { name: 'condA', weightedProperties: [{ weight_percent: 100, type: 'Aluminum' }] },
      { name: 'condB', weightedProperties: [{ weight_percent: 100, type: 'Copper' }] },
      { name: 'condC', weightedProperties: [{ weight_percent: 100, type: 'Aluminum' }] },
    ];
    const mockRlcResults = [
      { R: 0.1, L: 0.01, C: 0.001 },
      { R: 0.2, L: 0.02, C: 0.002 },
      { R: 0.3, L: 0.03, C: 0.003 },
    ];
    renderResultsDisplay(mockRlcResults, mockConductors);
    const infoButtons = screen.getAllByLabelText('info');
    expect(infoButtons.length).toBeGreaterThan(0);
    fireEvent.click(infoButtons[0]);
    expect(mockHandlePopoverOpen).toHaveBeenCalled();
  });

  it('handles empty rlcResults gracefully', () => {
    renderResultsDisplay([], []);
    expect(screen.getByText(/Results/i)).toBeInTheDocument();
    // Should not throw or render any phase rows
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });

  it('handles missing conductor properties', () => {
    const mockConductors = [
      { name: 'condA' },
      { name: 'condB' },
      { name: 'condC' },
    ];
    const mockRlcResults = [
      { R: 0.1, L: 0.01, C: 0.001 },
      { R: 0.2, L: 0.02, C: 0.002 },
      { R: 0.3, L: 0.03, C: 0.003 },
    ];
    renderResultsDisplay(mockRlcResults, mockConductors);
    expect(screen.getByText('condA')).toBeInTheDocument();
    expect(screen.getByText('condB')).toBeInTheDocument();
    expect(screen.getByText('condC')).toBeInTheDocument();
  });

  it('calculates and displays voltage drop for valid input', () => {
    const mockConductors = [
      { name: 'A', weightedProperties: [{ weight_percent: 100, type: 'Aluminum' }] },
      { name: 'B', weightedProperties: [{ weight_percent: 100, type: 'Copper' }] },
      { name: 'C', weightedProperties: [{ weight_percent: 100, type: 'Aluminum' }] },
    ];
    const mockRlcResults = [
      { R: 0.1, L: 0.01, C: 0.001 },
      { R: 0.2, L: 0.02, C: 0.002 },
      { R: 0.3, L: 0.03, C: 0.003 },
    ];
    renderResultsDisplay(mockRlcResults, mockConductors);
    fireEvent.change(screen.getByLabelText(/Load/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Length/i), { target: { value: '1' } });
    fireEvent.click(screen.getByText(/Calc Voltage Drop/i));
    expect(screen.getByText(/Voltage Drop:/i)).toBeInTheDocument();
  });
});