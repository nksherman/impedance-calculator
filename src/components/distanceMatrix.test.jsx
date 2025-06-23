import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import DistanceMatrix from './distanceMatrix';

// Helper to create a mock arrangement with a gmr() method
function mockArrangement(gmrValue) {
  return { gmr: () => gmrValue };
}

describe('DistanceMatrix integration and calculation', () => {

  function setup(conductorGmrs = [10, 20, 30]) {
    const setGmd = jest.fn();
    const conductorArrangements = conductorGmrs.map(gmr => mockArrangement(gmr));
    render(
      <DistanceMatrix
        gmd={0}
        setGmd={setGmd}
        conductorArrangements={conductorArrangements}
        unit={"mm"}
      />
    );
    return { setGmd };
  }

  it('correctly calls the mocked gmr for each conductor', () => {
    setup([10, 20, 30]);
    const labels = ["A", "B", "C"];
    const gmrValues = [10, 20, 30];
    gmrValues.forEach((value, idx) => {
      expect(screen.getByLabelText(`GMR${labels[idx]}`).value).toBe((value*1000).toFixed(4));
    });
  });

  it('renders correct number of distance and GMR fields for 3 conductors', () => {
    setup([10, 20, 30]);
    expect(screen.getByLabelText('GMRA')).toBeInTheDocument();
    expect(screen.getByLabelText('GMRB')).toBeInTheDocument();
    expect(screen.getByLabelText('GMRC')).toBeInTheDocument();
    expect(screen.getByLabelText('DAB')).toBeInTheDocument();
    expect(screen.getByLabelText('DAC')).toBeInTheDocument();
    expect(screen.getByLabelText('DBC')).toBeInTheDocument();
  });

  it('calculates GMD in mm and calls setGmd with correct value', () => {
    const { setGmd } = setup([10, 20, 30]);
    fireEvent.change(screen.getByLabelText('DAB'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('DAC'), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText('DBC'), { target: { value: '300' } });
    fireEvent.click(screen.getByText('Calculate GMD'));
    expect(setGmd).toHaveBeenCalled();
    const calledWith = setGmd.mock.calls[0][0];
    expect(calledWith).toBeCloseTo(1817.1205, 2);
  });

  it('shows error if any distance is invalid or <= 0', () => {
    const { setGmd } = setup([10, 20, 30]);
    fireEvent.change(screen.getByLabelText('DAB'), { target: { value: '-5' } });
    fireEvent.change(screen.getByLabelText('DAC'), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText('DBC'), { target: { value: '300' } });
    fireEvent.click(screen.getByText('Calculate GMD'));
    expect(setGmd).toHaveBeenCalledWith('Invalid distances');
  });

  it('renders correct number of fields for 2 conductors', () => {
    setup([10, 20]);
    expect(screen.getByLabelText('GMRA')).toBeInTheDocument();
    expect(screen.getByLabelText('GMRB')).toBeInTheDocument();
    expect(screen.getByLabelText('DAB')).toBeInTheDocument();
    expect(screen.queryByLabelText('GMRC')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('DAC')).not.toBeInTheDocument();
  });

  it('displays GMD result in mm and inches when gmd is set', () => {
    const conductorArrangements = [mockArrangement(10), mockArrangement(20), mockArrangement(30)];
    render(
      <DistanceMatrix
        gmd={100}
        setGmd={jest.fn()}
        conductorArrangements={conductorArrangements}
        unit={"mm"}
      />
    );
    expect(screen.getByText(/GMD = 100.0000 mm \(3.9370 in\)/)).toBeInTheDocument();
  });

  it('shows error message when gmd is "Invalid distances"', () => {
    const conductorArrangements = [mockArrangement(10), mockArrangement(20), mockArrangement(30)];
    render(
      <DistanceMatrix
        gmd="Invalid distances"
        setGmd={jest.fn()}
        conductorArrangements={conductorArrangements}
        unit={"mm"}
      />
    );
    expect(screen.getByText('Invalid distances')).toBeInTheDocument();
  });
});

describe('When Using the Neutral Conductor', () => {
  function setupWithNeutral(conductorGmrs = [10, 20, 30], neutralGmr = 40) {
    const setGmd = jest.fn();
    const conductorArrangements = conductorGmrs.map(gmr => mockArrangement(gmr));
    const neutralArrangement = mockArrangement(neutralGmr);
    render(
      <DistanceMatrix
        gmd={0}
        setGmd={setGmd}
        conductorArrangements={conductorArrangements}
        unit={"mm"}
        neutralArrangement={neutralArrangement}
      />
    );
    return { setGmd };
  }

  it('renders neutral conductor fields when neutralArrangement is set', () => {
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
    fireEvent.click(screen.getByText('Calculate GMD'));
    expect(setGmd).toHaveBeenCalledWith(expect.any(Number));
  });
});

describe('Manual GMD override and handleManualGmdChange', () => {
  function setupManual({ gmd = 0, unit = 'mm', conductorGmrs = [10, 20, 30] } = {}) {
    const setGmd = jest.fn();
    const conductorArrangements = conductorGmrs.map(gmr => mockArrangement(gmr));
    render(
      <DistanceMatrix
        gmd={gmd}
        setGmd={setGmd}
        conductorArrangements={conductorArrangements}
        unit={unit}
      />
    );
    fireEvent.click(screen.getByLabelText('Manual GMD override'));
    return { setGmd };
  }

  it('shows manual GMD input when override is enabled and hides when disabled', () => {
    const conductorArrangements = [mockArrangement(10), mockArrangement(20), mockArrangement(30)];
    render(
      <DistanceMatrix
        gmd={0}
        setGmd={jest.fn()}
        conductorArrangements={conductorArrangements}
        unit="mm"
      />
    );
    expect(screen.queryByLabelText('manual-gmd')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Manual GMD override'));
    expect(screen.getByLabelText('manual-gmd')).toBeInTheDocument();
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
    expect(setGmd).toHaveBeenLastCalledWith(50.8);
  });

  it('calls setGmd with "Invalid distances" for empty input', () => {
    const { setGmd } = setupManual({});
    const input = screen.getByLabelText('manual-gmd');
    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.change(input, { target: { value: '' } });
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
    expect(screen.getByLabelText('manual-gmd')).not.toBeDisabled();
    expect(screen.getByLabelText('DAB')).toBeDisabled();
    expect(screen.getByLabelText('DAC')).toBeDisabled();
    expect(screen.getByLabelText('DBC')).toBeDisabled();
  });

  it('enables all distance inputs when manual override is disabled', () => {
    const conductorArrangements = [mockArrangement(10), mockArrangement(20), mockArrangement(30)];
    render(
      <DistanceMatrix
        gmd={0}
        setGmd={jest.fn()}
        conductorArrangements={conductorArrangements}
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