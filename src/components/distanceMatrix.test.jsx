// Mocking getRadiusValue to return known values for testing
jest.mock('../data/conductorData', () => ({
  getRadiusValue: idx => {
    if (idx === 0) return 10;
    if (idx === 1) return 20;
    if (idx === 2) return 30;
    return 0;
  },
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import DistanceMatrix from './distanceMatrix';

describe('DistanceMatrix integration and calculation', () => {

  function setup(conductorIndices = [0, 1, 2]) {
    const setGmd = jest.fn();
    render(
      <DistanceMatrix
        gmd={0}
        setGmd={setGmd}
        conductorIndices={conductorIndices}
      />
    );
    return { setGmd };
  }

  it('correctly calls the mocked getRadiusValue for each conductor', () => {
    setup([0, 1, 2]);
    const radiusValues = [10, 20, 30];
    radiusValues.forEach((value, idx) => {
      expect(screen.getByLabelText(`GMR${idx + 1}`).value).toBe((value * Math.exp(-0.25)).toFixed(4));
    });
  });

  it('renders correct number of distance and GMR fields for 3 conductors', () => {
    setup([0, 1, 2]);
    expect(screen.getByLabelText('GMR1')).toBeInTheDocument();
    expect(screen.getByLabelText('GMR2')).toBeInTheDocument();
    expect(screen.getByLabelText('GMR3')).toBeInTheDocument();
    expect(screen.getByLabelText('D12')).toBeInTheDocument();
    expect(screen.getByLabelText('D13')).toBeInTheDocument();
    expect(screen.getByLabelText('D23')).toBeInTheDocument();
  });

  it('calculates GMD in mm and calls setGmd with correct value', () => {
    const { setGmd } = setup([0, 1, 2]);
    // Fill in D12, D13, D23
    fireEvent.change(screen.getByLabelText('D12'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('D13'), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText('D23'), { target: { value: '300' } });
    fireEvent.click(screen.getByText('Calculate GMD'));
    // GMD = (100*200*300)^(1/3) = 181.712059
    expect(setGmd).toHaveBeenCalledWith(expect.closeTo(181.712, 0.001));
  });

  it('shows error if any distance is invalid or <= 0', () => {
    const { setGmd } = setup([0, 1, 2]);
    fireEvent.change(screen.getByLabelText('D12'), { target: { value: '-5' } });
    fireEvent.change(screen.getByLabelText('D13'), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText('D23'), { target: { value: '300' } });
    fireEvent.click(screen.getByText('Calculate GMD'));
    expect(setGmd).toHaveBeenCalledWith('Invalid distances');
  });

  it('converts distances from inches to mm when unit is toggled', () => {
    const { setGmd } = setup([0, 1, 2]);
    // Switch to inches
    fireEvent.click(screen.getByText('inches'));
    // Enter D12, D13, D23 in inches
    fireEvent.change(screen.getByLabelText('D12'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('D13'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('D23'), { target: { value: '3' } });
    fireEvent.click(screen.getByText('Calculate GMD'));
    // GMD = (1*2*3)^(1/3) = 1.8171 in, convert to mm: 1.8171*25.4 = 46.202
    expect(setGmd).toHaveBeenCalledWith(expect.closeTo(46.202, 0.01));
  });

  it('renders correct number of fields for 2 conductors', () => {
    setup([0, 1]);
    expect(screen.getByLabelText('GMR1')).toBeInTheDocument();
    expect(screen.getByLabelText('GMR2')).toBeInTheDocument();
    expect(screen.getByLabelText('D12')).toBeInTheDocument();
    expect(screen.queryByLabelText('GMR3')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('D13')).not.toBeInTheDocument();
  });

  it('displays GMD result in mm and inches when gmd is set', () => {
    // Render with gmd set
    render(
      <DistanceMatrix
        gmd={100}
        setGmd={jest.fn()}
        conductorIndices={[0, 1, 2]}
      />
    );
    expect(screen.getByText(/GMD = 100.0000 mm \(3.9370 in\)/)).toBeInTheDocument();
  });

  it('shows error message when gmd is "Invalid distances"', () => {
    render(
      <DistanceMatrix
        gmd="Invalid distances"
        setGmd={jest.fn()}
        conductorIndices={[0, 1, 2]}
      />
    );
    expect(screen.getByText('Invalid distances')).toBeInTheDocument();
  });
});