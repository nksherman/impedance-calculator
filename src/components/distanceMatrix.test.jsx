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
        unit={"mm"}
        neutralIndex={""}
      />
    );
    return { setGmd };
  }

  it('correctly calls the mocked getRadiusValue for each conductor', () => {
    setup([0, 1, 2]);
    const labels = ["A", "B", "C"];

    const radiusValues = [10, 20, 30];
    radiusValues.forEach((value, idx) => {
      expect(screen.getByLabelText(`GMR${labels[idx]}`).value).toBe((value * Math.exp(-0.25)).toFixed(4));
    });
  });

  it('renders correct number of distance and GMR fields for 3 conductors', () => {
    setup([0, 1, 2]);
    expect(screen.getByLabelText('GMRA')).toBeInTheDocument();
    expect(screen.getByLabelText('GMRB')).toBeInTheDocument();
    expect(screen.getByLabelText('GMRC')).toBeInTheDocument();
    expect(screen.getByLabelText('DAB')).toBeInTheDocument();
    expect(screen.getByLabelText('DAC')).toBeInTheDocument();
    expect(screen.getByLabelText('DBC')).toBeInTheDocument();
  });

  it('calculates GMD in mm and calls setGmd with correct value', () => {
    const { setGmd } = setup([0, 1, 2]);
    // Fill in D12, D13, D23
    fireEvent.change(screen.getByLabelText('DAB'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('DAC'), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText('DBC'), { target: { value: '300' } });
    fireEvent.click(screen.getByText('Calculate GMD'));
    // GMD = (100*200*300)^(1/3) = 181.712059
    expect(setGmd).toHaveBeenCalled();
    const calledWith = setGmd.mock.calls[0][0];
    expect(calledWith).toBeCloseTo(181.712, 3);
  });

  it('shows error if any distance is invalid or <= 0', () => {
    const { setGmd } = setup([0, 1, 2]);
    fireEvent.change(screen.getByLabelText('DAB'), { target: { value: '-5' } });
    fireEvent.change(screen.getByLabelText('DAC'), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText('DBC'), { target: { value: '300' } });
    fireEvent.click(screen.getByText('Calculate GMD'));
    expect(setGmd).toHaveBeenCalledWith('Invalid distances');
  });

  it('renders correct number of fields for 2 conductors', () => {
    setup([0, 1]);
    expect(screen.getByLabelText('GMRA')).toBeInTheDocument();
    expect(screen.getByLabelText('GMRB')).toBeInTheDocument();
    expect(screen.getByLabelText('DAB')).toBeInTheDocument();
    expect(screen.queryByLabelText('GMRC')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('DAC')).not.toBeInTheDocument();
  });

  it('displays GMD result in mm and inches when gmd is set', () => {
    // Render with gmd set
    render(
      <DistanceMatrix
        gmd={100}
        setGmd={jest.fn()}
        conductorIndices={[0, 1, 2]}
        unit={"mm"}
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
        unit={"mm"}
      />
    );
    expect(screen.getByText('Invalid distances')).toBeInTheDocument();
  });
});

describe('When Using the Neutral Conductor', () => {
  // Custom setup for this block
  function setupWithNeutral(conductorIndices = [0, 1, 2], neutralIndex = 3) {
    const setGmd = jest.fn();
    render(
      <DistanceMatrix
        gmd={0}
        setGmd={setGmd}
        conductorIndices={conductorIndices}
        unit={"mm"}
        neutralIndex={neutralIndex}
      />
    );
    return { setGmd };
  }

  it('renders neutral conductor fields when neutralIndex is set', () => {
    setupWithNeutral();
    expect(screen.getByLabelText('GMRn')).toBeInTheDocument();
    expect(screen.getByLabelText('DnA')).toBeInTheDocument();
    expect(screen.getByLabelText('DnB')).toBeInTheDocument();
    expect(screen.getByLabelText('DnC')).toBeInTheDocument();
  });

  it('calculates GMD including neutral conductor', () => {
    const { setGmd } = setupWithNeutral();
    fireEvent.change(screen.getByLabelText('DAB'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('DAC'), { target: { value: '127' } });
    fireEvent.change(screen.getByLabelText('DBC'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('DnA'), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText('DnB'), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText('DnC'), { target: { value: '210' } });
    // ...other changes...
    fireEvent.click(screen.getByText('Calculate GMD'));
    expect(setGmd).toHaveBeenCalledWith(expect.any(Number));
  });
});
describe('Manual GMD override and handleManualGmdChange', () => {
  function setupManual({ gmd = 0, unit = 'mm', conductorIndices = [0, 1, 2] } = {}) {
    const setGmd = jest.fn();
    render(
      <DistanceMatrix
        gmd={gmd}
        setGmd={setGmd}
        conductorIndices={conductorIndices}
        unit={unit}
      />
    );
    // Enable manual override
    fireEvent.click(screen.getByLabelText('Manual GMD override'));
    return { setGmd };
  }

  it('shows manual GMD input when override is enabled and hides when disabled', () => {
    render(
      <DistanceMatrix
        gmd={0}
        setGmd={jest.fn()}
        conductorIndices={[0, 1, 2]}
        unit="mm"
      />
    );
    // Initially not present
    expect(screen.queryByLabelText('manual-gmd')).not.toBeInTheDocument();
    // Enable manual override
    fireEvent.click(screen.getByLabelText('Manual GMD override'));
    expect(screen.getByLabelText('manual-gmd')).toBeInTheDocument();
    // Disable manual override
    fireEvent.click(screen.getByLabelText('Manual GMD override'));
    expect(screen.queryByLabelText('manual-gmd')).not.toBeInTheDocument();
  });

  it('calls setGmd with correct value in mm when unit is mm', () => {
    const { setGmd } = setupManual({ unit: 'mm' });
    const input = screen.getByLabelText('manual-gmd');
    fireEvent.change(input, { target: { value: '123.45' } });
    expect(setGmd).toHaveBeenLastCalledWith(123.45);
  });

  it('calls setGmd with correct value in mm when unit is in', () => {
    const { setGmd } = setupManual({ unit: 'in' });
    const input = screen.getByLabelText('manual-gmd');
    fireEvent.change(input, { target: { value: '2' } });
    // 2 inches = 50.8 mm
    expect(setGmd).toHaveBeenLastCalledWith(50.8);
  });

  it('calls setGmd with "Invalid distances" for empty input', () => {
      const { setGmd } = setupManual({});
      const input = screen.getByLabelText('manual-gmd');
      fireEvent.change(input, { target: { value: '123' } }); // Set to a valid value first
      fireEvent.change(input, { target: { value: '' } });    // Then clear it
      expect(setGmd).toHaveBeenLastCalledWith('Invalid distances');
  });

  it('calls setGmd with "Invalid distances" for non-numeric input', () => {
    const { setGmd } = setupManual({});
    const input = screen.getByLabelText('manual-gmd');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(setGmd).toHaveBeenLastCalledWith('Invalid distances');
  });

  it('calls setGmd with "Invalid distances" for zero or negative input', () => {
    const { setGmd } = setupManual({});
    const input = screen.getByLabelText('manual-gmd');
    fireEvent.change(input, { target: { value: '0' } });
    expect(setGmd).toHaveBeenLastCalledWith('Invalid distances');
    fireEvent.change(input, { target: { value: '-5' } });
    expect(setGmd).toHaveBeenLastCalledWith('Invalid distances');
  });

  it('disables all distance inputs when manual override is enabled', () => {
    setupManual({});
    // All distance fields should be disabled except manual-gmd
    expect(screen.getByLabelText('manual-gmd')).not.toBeDisabled();
    expect(screen.getByLabelText('DAB')).toBeDisabled();
    expect(screen.getByLabelText('DAC')).toBeDisabled();
    expect(screen.getByLabelText('DBC')).toBeDisabled();
  });

  it('enables all distance inputs when manual override is disabled', () => {
    render(
      <DistanceMatrix
        gmd={0}
        setGmd={jest.fn()}
        conductorIndices={[0, 1, 2]}
        unit="mm"
      />
    );
    expect(screen.getByLabelText('DAB')).not.toBeDisabled();
    expect(screen.getByLabelText('DAC')).not.toBeDisabled();
    expect(screen.getByLabelText('DBC')).not.toBeDisabled();
  });

  it('shows correct unit in manual GMD input and label for mm', () => {
    setupManual({ unit: 'mm' });
    expect(screen.getByLabelText('manual-gmd').parentElement.textContent).toMatch(/mm/);
    expect(screen.getByText(/Enter GMD manually \(mm\)/)).toBeInTheDocument();
  });

  it('shows correct unit in manual GMD input and label for in', () => {
    setupManual({ unit: 'in' });
    expect(screen.getByLabelText('manual-gmd').parentElement.textContent).toMatch(/in/);
    expect(screen.getByText(/Enter GMD manually \(in\)/)).toBeInTheDocument();
  });
});