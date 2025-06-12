import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConductorInput from './conductorInput';

jest.mock('../data/conductorData', () => ({
  conductorData: [
    { name: 'CondA', strand_count: 7, strand_dia: 1.1, outer_diam: 3.3 },
    { name: 'CondB', strand_count: 19, strand_dia: 0.9, outer_diam: 4.5 },
  ],
  conductorProperties: [
    { type: 'Copper', resistivity: 1.68e-8, temp_coef_of_resistivity: 0.0039, conductor_permeability: 1.2566e-6, conductor_permissivity: 8.85e-12, conductor_conductivity: 5.96e7 },
    { type: 'Aluminum', resistivity: 2.82e-8, temp_coef_of_resistivity: 0.004, conductor_permeability: 1.2566e-6, conductor_permissivity: 8.85e-12, conductor_conductivity: 3.77e7 },
  ],
}));

describe('ConductorInput', () => {
  let setConductorIndices, setPropertyIndices;

  function setup(indices = [0], propIndices = [0]) {
    setConductorIndices = jest.fn();
    setPropertyIndices = jest.fn();
    render(
      <ConductorInput
        conductorIndices={indices}
        setConductorIndices={setConductorIndices}
        propertyIndices={propIndices}
        setPropertyIndices={setPropertyIndices}
      />
    );
  }


  it('add conductor row up to 4 and disables button at 4', () => {
    setup([0, 0, 0, 0], [0, 0, 0, 0]);
    const addBtn = screen.getByRole('button', { name: /add conductor/i });
    expect(addBtn).toBeDisabled();
  });

  it('add conductor row increases rows', () => {
    setup([0, 0], [0, 0]);
    const addBtn = screen.getByRole('button', { name: /add conductor/i });
    fireEvent.click(addBtn);
    expect(setConductorIndices).toHaveBeenCalledWith([0, 0, 0]);
    expect(setPropertyIndices).toHaveBeenCalledWith([0, 0, 0]);
  });

  it('remove conductor row decreases rows, disables at 1', () => {
    setup([0, 1], [0, 1]);
    const removeBtns = screen.getAllByLabelText('remove');
    fireEvent.click(removeBtns[1]);
    expect(setConductorIndices).toHaveBeenCalledWith([0]);
    expect(setPropertyIndices).toHaveBeenCalledWith([0]);
  });

  it('remove button is disabled when only one row', () => {
    setup();
    const removeBtn = screen.getByLabelText('remove');
    expect(removeBtn).toBeDisabled();
  });

  it('changing conductor select updates index', () => {
    setup();
    const select = screen.getByRole('combobox', { name: 'Conductor A' });
    fireEvent.mouseDown(select);
    const option = screen.getByText('CondB');
    fireEvent.click(option);
    expect(setConductorIndices).toHaveBeenCalledWith([1]);
  });

  it('changing material select updates index', () => {
    setup();
    const select = screen.getByRole('combobox', { name: 'Material A' });
    fireEvent.mouseDown(select);
    const option = screen.getByText('Aluminum');
    fireEvent.click(option);
    expect(setPropertyIndices).toHaveBeenCalledWith([1]);
  });
});