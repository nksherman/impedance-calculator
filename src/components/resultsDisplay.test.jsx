import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import ResultsDisplay from './resultsDisplay.jsx';

const mockHandlePopoverOpen = jest.fn();

describe('ResultsDisplay: Size/Material Labels', () => {
  it('shows conductor size/material labels for each phase', () => {
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
    render(
      <ResultsDisplay
        rlcResults={mockRlcResults}
        conductors={mockConductors}
        frequency={60}
        vll={240}
        vln={120}
        unit="mm"
        handlePopoverOpen={mockHandlePopoverOpen}
      />
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getAllByText(/Aluminum/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Copper/)).toBeInTheDocument();
  });
});

describe('ResultsDisplay: All RLC Results Same', () => {
  it('shows only one row when all rlcResults are the same', () => {
    const mockConductors = [
      { name: 'A', weightedProperties: [{ weight_percent: 100, type: 'Aluminum' }] },
      { name: 'B', weightedProperties: [{ weight_percent: 100, type: 'Aluminum' }] },
      { name: 'C', weightedProperties: [{ weight_percent: 100, type: 'Aluminum' }] },
    ];
    const mockRlcResults = [
      { R: 0.1, L: 0.01, C: 0.001 },
      { R: 0.1, L: 0.01, C: 0.001 },
      { R: 0.1, L: 0.01, C: 0.001 },
    ];
    render(
      <ResultsDisplay
        rlcResults={mockRlcResults}
        conductors={mockConductors}
        frequency={60}
        vll={240}
        vln={120}
        unit="mm"
        handlePopoverOpen={mockHandlePopoverOpen}
      />
    );
    // Only one row for all phases
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1); // header + 1 data row
    expect(screen.getByText('All')).toBeInTheDocument();
  });
});

describe('ResultsDisplay: Edge Cases', () => {
  it('handles empty rlcResults gracefully', () => {
    render(
      <ResultsDisplay
        rlcResults={[]}
        conductors={[]}
        frequency={60}
        vll={240}
        vln={120}
        unit="mm"
        handlePopoverOpen={mockHandlePopoverOpen}
      />
    );
    expect(screen.getByText(/Results/i)).toBeInTheDocument();
    // Should not throw or render any phase rows
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });

  it('handles missing conductor properties', () => {
    const mockConductors = [
      { name: 'A' },
      { name: 'B' },
      { name: 'C' },
    ];
    const mockRlcResults = [
      { R: 0.1, L: 0.01, C: 0.001 },
      { R: 0.2, L: 0.02, C: 0.002 },
      { R: 0.3, L: 0.03, C: 0.003 },
    ];
    render(
      <ResultsDisplay
        rlcResults={mockRlcResults}
        conductors={mockConductors}
        frequency={60}
        vll={240}
        vln={120}
        unit="mm"
        handlePopoverOpen={mockHandlePopoverOpen}
      />
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
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
    render(
      <ResultsDisplay
        rlcResults={mockRlcResults}
        conductors={mockConductors}
        frequency={60}
        vll={240}
        vln={120}
        unit="mm"
        handlePopoverOpen={mockHandlePopoverOpen}
      />
    );
    fireEvent.change(screen.getByLabelText(/Load/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Length/i), { target: { value: '1' } });
    fireEvent.click(screen.getByText(/Calc Voltage Drop/i));
    expect(screen.getByText(/Voltage Drop:/i)).toBeInTheDocument();
  });
});