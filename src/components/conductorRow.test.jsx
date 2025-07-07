import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConductorRow from './conductorRow';

// Mocks for dependencies
jest.mock('./conductor/conductorStrandGraphic', () => () => <div data-testid="mock-strand-graphic" />);
jest.mock('./conductor/conductorModel.ts', () => {
  class SolidConductor {
    constructor(props) { Object.assign(this, props); }
    conductorProperties() { return { type: 'Copper' }; }
    weightedProperties() { return [{ type: 'Copper', weight_percent: 100, temp_reference: 20, resistivity: 1.68e-8, temp_coef_of_resistivity: 0.0039, permeability_relative: 1, conductivity: 5.96e7 }]; }
  }
  class StrandedConductor {
    constructor(props) { Object.assign(this, props); }
    coreProperties() { return { type: 'Aluminum' }; }
    conductorProperties() { return { type: 'Copper' }; }
    weightedProperties() { return [{ type: 'Copper', weight_percent: 80, temp_reference: 20, resistivity: 1.68e-8, temp_coef_of_resistivity: 0.0039, permeability_relative: 1, conductivity: 5.96e7 }, { type: 'Aluminum', weight_percent: 20, temp_reference: 20, resistivity: 2.82e-8, temp_coef_of_resistivity: 0.004, permeability_relative: 1, conductivity: 3.77e7 }]; }
  }
  return { SolidConductor, StrandedConductor };
});


const mockConductorData = [
  { name: 'CondA', strand_count: 7, strand_dia: 1.1, outer_dia: 3.3 },
  { name: 'CondB', strand_count: 19, strand_dia: 0.9, outer_dia: 4.5 },
  { name: 'CondCored', strand_count: 37, strand_dia: 0.5, outer_dia: 6.0, core_strand_count: 2, core_strand_dia: 2.9235 },
  { name: 'CondD', strand_count: 1, strand_dia: 10.0, outer_dia: 10.0 } // Solid conductor
];

const mockConductorProperties = [
  { type: 'Copper', resistivity: 1.68e-8, temp_coef_of_resistivity: 0.0039, permeability_relative: 1, conductivity: 5.96e7 },
  { type: 'Aluminum', resistivity: 2.82e-8, temp_coef_of_resistivity: 0.004, permeability_relative: 1, conductivity: 3.77e7 },
  { type: 'Steel', resistivity: 1.0e-7, temp_coef_of_resistivity: 0.006, permeability_relative: 1000, conductivity: 1.0e6 },
];

describe('ConductorRow', () => {
  let handleConductorChange;
  let handlePropertyChange;
  let handleCorePropertyChange;
  let handlePopoverOpen;

  function setup({conductor}) {

    render(
      <ConductorRow
        conductor={conductor}
        rowName="A"
        handleConductorChange={handleConductorChange}
        handlePropertyChange={handlePropertyChange}
        handleCorePropertyChange={handleCorePropertyChange}
        handlePopoverOpen={handlePopoverOpen}
        conductorDataArray={mockConductorData}
        conductorPropertiesArray={mockConductorProperties}
      />
    );
  }

  beforeEach(() => {
    handleConductorChange = jest.fn();
    handlePropertyChange = jest.fn();
    handleCorePropertyChange = jest.fn();
    handlePopoverOpen = jest.fn();
    // clear all mocks globally:
    jest.clearAllMocks();
  });


  it('calls conductorChange when conductor select changes', () => {
    setup({ conductor: mockConductorData[0] });
    const select = screen.getByRole('combobox', { name: 'Conductor A' });
    fireEvent.mouseDown(select);
    const option = screen.getByText('CondB');
    fireEvent.click(option);
    expect(handleConductorChange).toHaveBeenCalledWith(1);
  });

  it('can select material option', () => {
    setup({ conductor: mockConductorData[0] });
    const select = screen.getByRole('combobox', { name: 'Material A' });
    fireEvent.mouseDown(select);
    const option = screen.getByText('Steel');
    fireEvent.click(option);
    expect(handlePropertyChange).toHaveBeenCalledWith(2);
  });

  describe('core material conductors', () => {

    const mockCoreConductor = {
      name: 'CondCored',
      strand_count: 37,
      strand_dia: 0.5,
      outer_dia: 6.0,
      core_strand_count: 2,
      core_strand_dia: 2.9235,
      compositeCore: true,

      weightedProperties: {
        type: 'Copper',
        weight_percent: 100,
        temp_reference: 20,
        resistivity: 1.68e-8,
        temp_coef_of_resistivity: 0.0039,
        permeability_relative: 1,
        conductivity: 5.96e7
      },
      conductorProperties: { type: 'Copper' },
      coreProperties: { type: 'Copper' },
      arrangement: true
    };
    
    it('shows core material select when coreProperty exists', () => {
      setup({ conductor: mockCoreConductor });
      expect(screen.getByRole('combobox', { name: /Core Material A/i })).toBeInTheDocument();
    });

    it('does not show core material sleect with no composite core', () => {
      const nonCoreConductor = {
        name: 'CondA',
        strand_count: 7,
        strand_dia: 1.1,

        outer_dia: 3.3,
        compositeCore: false,
        weightedProperties: {
          type: 'Copper',
          weight_percent: 100,
          temp_reference: 20,
          resistivity: 1.68e-8,
          temp_coef_of_resistivity: 0.0039,

          permeability_relative: 1,
          conductivity: 5.96e7
        },
        conductorProperties: { type: 'Copper' },
        arrangement: true
      };
      setup({ conductor: nonCoreConductor });
      expect(screen.queryByRole('combobox', { name: /Core Material A/i }))
        .not.toBeInTheDocument();
    });

    it('calls handleCorePropertyChange when core material select changes', () => {
      setup({ conductor: mockCoreConductor });
      const select = screen.getByRole('combobox', { name: 'Core Material A' });

      fireEvent.mouseDown(select);
      const option = screen.getByText('Steel');
      fireEvent.click(option);
      expect(handleCorePropertyChange).toHaveBeenCalledWith(2);
    });

    it('calls handlePopoverOpen with a content component that renders the mock-strand-graphic when info icon is clicked', () => {
      setup({ conductor: mockCoreConductor });
      const infoIcon = screen.getAllByRole('button', { name: 'info' })[0];
      fireEvent.click(infoIcon);
      expect(handlePopoverOpen).toHaveBeenCalled();
      // The second argument should be a React component (function or class)
      const content = handlePopoverOpen.mock.calls[0][1];
      expect(typeof content).toBe('object'); // React element or function
      // If it's a function component, render it and check for the mock-strand-graphic
      let rendered;
      if (typeof content === 'function') {
        rendered = render(React.createElement(content));
      } else {
        rendered = render(content);
      }
      expect(rendered.getByTestId('mock-strand-graphic')).toBeInTheDocument();
    });
  });
});
