import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mock child components and data to isolate App logic
jest.mock('./components/conductorInput', () => (props) => (
  <div data-testid="conductor-input">
    <button onClick={() => props.setConductorIndices([0, 0, 0, 0])}>Add Conductor</button>
    <button onClick={() => props.setConductorIndices([0, 0])}>Remove Conductor</button>
  </div>
));
jest.mock('./components/distanceMatrix', () => (props) => (
  <div data-testid="distance-matrix">
    <button onClick={() => props.setGmd(1000)}>Set GMD</button>
  </div>
));

describe('App', () => {
  test('renders main title and child components', () => {
    render(<App />);
    expect(screen.getByText(/Geometric Mean Distance Calculator/i)).toBeInTheDocument();
    expect(screen.getByTestId('conductor-input')).toBeInTheDocument();
    expect(screen.getByTestId('distance-matrix')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Calculate RLC/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/frequency/i)).toBeInTheDocument();
  });

  test('frequency input accepts valid numbers and rejects invalid', () => {
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

  test('can add and remove conductors via child component', () => {
    render(<App />);
    // Add conductor (simulate up to 4)
    const addBtn = screen.getByText('Add Conductor');
    fireEvent.click(addBtn);
    // Remove conductor (simulate down to 2)
    const removeBtn = screen.getByText('Remove Conductor');
    fireEvent.click(removeBtn);
    // No assertion needed, just ensure no crash
  });

  test('can set GMD via DistanceMatrix child', () => {
    render(<App />);
    const setGmdBtn = screen.getByText('Set GMD');
    fireEvent.click(setGmdBtn);
    // No assertion needed, just ensure no crash
  });

  test('shows per-unit-length and total values after calculation', () => {
    render(<App />);
    // Set GMD to a valid value
    fireEvent.click(screen.getByText('Set GMD'));
    // Click calculate
    fireEvent.click(screen.getByRole('button', { name: /Calculate RLC/i }));
    // Should show per-unit-length and total values
    expect(screen.getAllByText(/Per-unit-length values:/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Total Values:/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Resistance XL/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Resistance XC/i)).toBeInTheDocument();
  });

  test('per-unit-length values update when GMD or frequency changes', () => {
    render(<App />);
    // Set GMD and calculate
    fireEvent.click(screen.getByText('Set GMD'));
    fireEvent.click(screen.getByRole('button', { name: /Calculate RLC/i }));
    const xlBefore = screen.getByText(/Total Resistance XL/i).textContent;

    // Change frequency
    const freqInput = screen.getByLabelText(/frequency/i);
    fireEvent.change(freqInput, { target: { value: '120' } });
    fireEvent.click(screen.getByRole('button', { name: /Calculate RLC/i }));
    const xlAfter = screen.getByText(/Total Resistance XL/i).textContent;

    expect(xlBefore).not.toEqual(xlAfter);
  });
});