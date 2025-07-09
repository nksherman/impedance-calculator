import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mock child components to control App state
jest.mock('./components/conductorInput', () => (props) => {
  function mockCreateConductorModel(name = 'MockConductor') {
    return {
      name,
      circumscribedRadius: jest.fn(() => 0.01),
      effectivePermeability: jest.fn(() => 1),
      resistanceFn: jest.fn(() => () => 0.1),
      gmr: jest.fn(() => 0.008),
      weightedProperties: jest.fn(() => [{ weight_percent: 100, type: 'Aluminum' }]),
    };
  }
  // Simulate adding/removing conductors by updating the array of conductorModels
  return (
    <div data-testid="conductor-input">
      <button onClick={() => props.setConductorArrangements([
        mockCreateConductorModel('A'),
        mockCreateConductorModel('B'),
        mockCreateConductorModel('C'),
        mockCreateConductorModel('D'),
      ])}>Add Conductor</button>
      <button onClick={() => props.setConductorArrangements([
        mockCreateConductorModel('A'),
        mockCreateConductorModel('B'),
      ])}>Remove Conductor</button>
    </div>
  );
});

jest.mock('./components/distanceMatrix', () => (props) => (
  <div data-testid="distance-matrix">
    <button onClick={() => props.setGmd(1000)}>Set GMD</button>
  </div>
));

jest.mock('./components/neutralInput', () => (props) => {
  function mockCreateConductorModel(name = 'MockConductor') {
    return {
      name,
      circumscribedRadius: jest.fn(() => 0.01),
      effectivePermeability: jest.fn(() => 1),
      resistanceFn: jest.fn(() => () => 0.1),
      gmr: jest.fn(() => 0.008),
      weightedProperties: [{ weight_percent: 100, type: 'Aluminum' }],
    };
  }
  return (
    <div data-testid="neutral-input">
      <button onClick={() => props.setNeutralArrangement(mockCreateConductorModel('Neutral'))}>Set Neutral</button>
      <button onClick={() => props.setNeutralArrangement("")}>Clear Neutral</button>
    </div>
  );
});

jest.mock('./components/resultsDisplay', () => (props) => (
  <div data-testid="results-display">
    <h2>Results</h2>
    {/* No data parsed, with place holder conductorModels */}
  </div>
));



describe('App', () => {
  it('renders main title and child components', () => {
    render(<App />);
    expect(screen.getByText(/Geometric Mean Distance Calculator/i)).toBeInTheDocument();
    expect(screen.getByTestId('conductor-input')).toBeInTheDocument();
    expect(screen.getByTestId('distance-matrix')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Calculate RLC/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/frequency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/temperature/i)).toBeInTheDocument();
  }); 

  it('frequency input accepts valid numbers and rejects invalid', () => {
    render(<App />);
    const freqInput = screen.getByLabelText(/frequency/i);

    fireEvent.change(freqInput, { target: { value: '100' } });
    expect(freqInput.value).toBe('100');
    expect(screen.queryByTestId('freq-error')).not.toBeInTheDocument();

    fireEvent.change(freqInput, { target: { value: '-5' } });
    expect(screen.getByTestId('freq-error')).toBeInTheDocument();

    fireEvent.change(freqInput, { target: { value: 'abc' } });
    expect(screen.getByTestId('freq-error')).toBeInTheDocument();
  });

  it('temperature input accepts valid numbers and rejects invalid', () => {
    render(<App />);
    const tempInput = screen.getByLabelText(/temperature/i);

    fireEvent.change(tempInput, { target: { value: '50' } });
    expect(tempInput.value).toBe('50');
    expect(screen.queryByTestId('temp-error')).not.toBeInTheDocument();

    fireEvent.change(tempInput, { target: { value: 'abc' } });
    expect(screen.getByTestId('temp-error')).toBeInTheDocument();
  });

  it('can add and remove conductors via child component', () => {
    render(<App />);
    const addBtn = screen.getByText('Add Conductor');
    fireEvent.click(addBtn);
    const removeBtn = screen.getByText('Remove Conductor');
    fireEvent.click(removeBtn);
    // No assertion needed, just ensure no crash
  });

  it('can set GMD via DistanceMatrix child', () => {
    render(<App />);
    const setGmdBtn = screen.getByText('Set GMD');
    fireEvent.click(setGmdBtn);
    // No assertion needed, just ensure no crash
  });

  it('can set and clear neutral via NeutralInput child', () => {
    render(<App />);
    const setNeutralBtn = screen.getByText('Set Neutral');
    fireEvent.click(setNeutralBtn);
    const clearNeutralBtn = screen.getByText('Clear Neutral');
    fireEvent.click(clearNeutralBtn);
    // No assertion needed, just ensure no crash
  });

  it('renders ResultsDisplay after calculation', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Set GMD'));
    fireEvent.click(screen.getByRole('button', { name: /Calculate RLC/i }));
    // ResultsDisplay should be present (look for Results heading)
    expect(screen.getByText(/Results/i)).toBeInTheDocument();
  });
});