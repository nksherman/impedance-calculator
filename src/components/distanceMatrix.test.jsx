import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DistanceMatrix from './distanceMatrix';

describe('DistanceMatrix', () => {
  const mockDistances = [
    ['', '2.5', '3.0'],
    ['2.5', '', '4.0'],
    ['3.0', '4.0', ''],
  ];
  const mockOnDistanceChange = jest.fn();
  const mockGetRadiusValue = jest.fn(idx => 0.5 + idx); // returns 0.5, 1.5, 2.5 for i=0,1,2

  beforeEach(() => {
    mockOnDistanceChange.mockClear();
  });

  it('renders all distance inputs and GMR fields', () => {
    render(
      <DistanceMatrix
        distances={mockDistances}
        onDistanceChange={mockOnDistanceChange}
        getRadiusValue={mockGetRadiusValue}
      />
    );

    // Check labels for GMR and Dxy
    expect(screen.getByLabelText('GMR1')).toBeInTheDocument();
    expect(screen.getByLabelText('GMR2')).toBeInTheDocument();
    expect(screen.getByLabelText('GMR3')).toBeInTheDocument();
    expect(screen.getByLabelText('D12')).toBeInTheDocument();
    expect(screen.getByLabelText('D13')).toBeInTheDocument();
    expect(screen.getByLabelText('D21')).toBeInTheDocument();
    expect(screen.getByLabelText('D23')).toBeInTheDocument();
    expect(screen.getByLabelText('D31')).toBeInTheDocument();
    expect(screen.getByLabelText('D32')).toBeInTheDocument();
  });

  it('displays calculated self-distance for diagonal (GMR) fields', () => {
    render(
      <DistanceMatrix
        distances={mockDistances}
        onDistanceChange={mockOnDistanceChange}
        getRadiusValue={mockGetRadiusValue}
      />
    );
    // GMR1: r = 0.5
    expect(screen.getByLabelText('GMR1').value).toBe((0.5 * Math.exp(-0.25)).toFixed(4));
    // GMR2: r = 1.5
    expect(screen.getByLabelText('GMR2').value).toBe((1.5 * Math.exp(-0.25)).toFixed(4));
    // GMR3: r = 2.5
    expect(screen.getByLabelText('GMR3').value).toBe((2.5 * Math.exp(-0.25)).toFixed(4));
  });

  it('calls onDistanceChange when a non-diagonal input is changed', () => {
    render(
      <DistanceMatrix
        distances={mockDistances}
        onDistanceChange={mockOnDistanceChange}
        getRadiusValue={mockGetRadiusValue}
      />
    );
    const input = screen.getByLabelText('D12');
    fireEvent.change(input, { target: { value: '5.5' } });
    expect(mockOnDistanceChange).toHaveBeenCalledWith(0, 1, '5.5');
  });

  it('does not call onDistanceChange for invalid input', () => {
    render(
      <DistanceMatrix
        distances={mockDistances}
        onDistanceChange={mockOnDistanceChange}
        getRadiusValue={mockGetRadiusValue}
      />
    );
    const input = screen.getByLabelText('D12');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(mockOnDistanceChange).not.toHaveBeenCalled();
  });

  it('disables diagonal (GMR) inputs', () => {
    render(
      <DistanceMatrix
        distances={mockDistances}
        onDistanceChange={mockOnDistanceChange}
        getRadiusValue={mockGetRadiusValue}
      />
    );
    expect(screen.getByLabelText('GMR1')).toBeDisabled();
    expect(screen.getByLabelText('GMR2')).toBeDisabled();
    expect(screen.getByLabelText('GMR3')).toBeDisabled();
  });
});