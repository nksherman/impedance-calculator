import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConductorInput from './conductorInput';


// Minimal createConductor mock to match usage in component
jest.mock('./conductorHelpers', () => ({
  createConductor: (data, props) => ({ ...data, properties: props }),
}));

const mockConductorData = [
  { name: 'CondA', strand_count: 7, strand_dia: 1.1, outer_dia: 3.3 },
  { name: 'CondB', strand_count: 19, strand_dia: 0.9, outer_dia: 4.5 },
];

const mockConductorProperties = [
  { type: 'Copper', resistivity: 1.68e-8, temp_coef_of_resistivity: 0.0039, conductor_permeability: 1.2566e-6, conductor_permissivity: 8.85e-12, conductivity: 5.96e7 },
  { type: 'Aluminum', resistivity: 2.82e-8, temp_coef_of_resistivity: 0.004, conductor_permeability: 1.2566e-6, conductor_permissivity: 8.85e-12, conductivity: 3.77e7 },
];

// //revised when insulator properties used
// jest.mock('../data/insulatorProperties.json', () => ([
//   { type: 'Polyethylene', dielectric_strength: 20, dielectric_constant: 2.3, loss_tangent: 0.0001 },
// ]));

describe('ConductorInput', () => {
  let conductorArrangements;
  let setConductorArrangements;

  beforeEach(() => {
    conductorArrangements = [
      { name: 'CondA', strand_count: 7, strand_dia: 1.1, outer_dia: 3.3, properties: { type: 'Copper' } },
    ];
    setConductorArrangements = jest.fn();
  });

  function setup(arr = conductorArrangements) {
    render(
      <ConductorInput
        conductorArrangements={arr}
        setConductorArrangements={setConductorArrangements}
        conductorData={mockConductorData}
        conductorProperties={mockConductorProperties}
        unit="mm"
        handlePopoverOpen={jest.fn()}
      />
    );
  }

  it('add conductor row up to 4 and disables button at 4', () => {
    const arr = Array(4).fill({ name: 'CondA', strand_count: 7, strand_dia: 1.1, outer_dia: 3.3, properties: { type: 'Copper' } });
    setup(arr);
    const addBtn = screen.getByRole('button', { name: /add conductor/i });
    expect(addBtn).toBeDisabled();
  });

  it('add conductor row increases rows', () => {
    const arr = [
      { name: 'CondA', strand_count: 7, strand_dia: 1.1, outer_dia: 3.3, properties: { type: 'Copper' } },
      { name: 'CondB', strand_count: 19, strand_dia: 0.9, outer_dia: 4.5, properties: { type: 'Copper' } },
    ];
    setup(arr);
    const addBtn = screen.getByRole('button', { name: /add conductor/i });
    fireEvent.click(addBtn);
    expect(setConductorArrangements).toHaveBeenCalledWith([
      ...arr,
      expect.objectContaining({ name: 'CondA', properties: expect.any(Object) })
    ]);
  });

  it('remove conductor row decreases rows, disables at 1', () => {
    const arr = [
      { name: 'CondA', strand_count: 7, strand_dia: 1.1, outer_dia: 3.3, properties: { type: 'Copper' } },
      { name: 'CondB', strand_count: 19, strand_dia: 0.9, outer_dia: 4.5, properties: { type: 'Copper' } },
    ];
    setup(arr);
    const removeBtns = screen.getAllByLabelText('remove');
    fireEvent.click(removeBtns[1]);
    expect(setConductorArrangements).toHaveBeenCalledWith([
      arr[0]
    ]);
  });

  it('remove button is disabled when only one row', () => {
    setup();
    const removeBtn = screen.getByLabelText('remove');
    expect(removeBtn).toBeDisabled();
  });

  it('changing conductor select updates arrangement', () => {
    setup();
    const select = screen.getByRole('combobox', { name: 'Conductor A' });
    fireEvent.mouseDown(select);
    const option = screen.getByText('CondB');
    fireEvent.click(option);
    expect(setConductorArrangements).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'CondB' })
    ]);
  });

  it('changing material select updates arrangement', () => {
    setup();
    const select = screen.getByRole('combobox', { name: 'Material A' });
    fireEvent.mouseDown(select);
    const option = screen.getByText('Aluminum');
    fireEvent.click(option);
    expect(setConductorArrangements).toHaveBeenCalledWith([
      expect.objectContaining({ properties: expect.objectContaining({ type: 'Aluminum' }) })
    ]);
  });
});