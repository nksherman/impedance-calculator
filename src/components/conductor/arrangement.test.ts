import { closePackedCore, ConductorArrangement, ConductorArrangementCore } from './arrangement';

const conductorProperties = [
  {
    "type": "Copper",
    "temp_reference": 20,
    "resistivity": 0.0000000168,
    "temp_coef_of_resistivity": 0.00393,
    "permeability_relative": 0.999994,
    "conductivity": 58.0
  },
  {
    "type": "Aluminum",
    "temp_reference": 20,
    "resistivity": 0.0000000282,
    "temp_coef_of_resistivity": 0.0039,
    "permeability_relative": 1.000022,
    "conductivity": 35.0
  }
]

describe('closePackedCore', () => {
  it('should return a single strand at the center for 1 strand', () => {
    const result = closePackedCore(1, 5);
    expect(result).toEqual([{ r: 0, theta: 0, radius: 5 }]);
  });

  it('should return two strands side by side for 2 strands', () => {
    const result = closePackedCore(2, 5);
    expect(result).toEqual([
      { r: 5, theta: 0, radius: 5 },
      { r: 5, theta: Math.PI, radius: 5 }
    ]);
  });

  it('should return three strands in a triangle for 3 strands', () => {
    const rad = 5 / Math.sqrt(3);
    const result = closePackedCore(3, 5);
    expect(result).toEqual([
      { r: rad, theta: 0, radius: 5 },
      { r: rad, theta: (2 * Math.PI) / 3, radius: 5 },
      { r: rad, theta: (4 * Math.PI) / 3, radius: 5 }
    ]);
  });

  it('should return four strands in a square for 4 strands', () => {
    const rad = 5 * Math.sqrt(8);
    const result = closePackedCore(4, 5);
    expect(result).toEqual([
      { r: rad, theta: 0, radius: 5 },
      { r: rad, theta: Math.PI / 2, radius: 5 },
      { r: rad, theta: Math.PI, radius: 5 },
      { r: rad, theta: (3 * Math.PI) / 2, radius: 5 }
    ]);
  });
});


describe('ConductorArrangement', () => {
  it('should create a valid arrangement matrix for a single strand', () => {
    const arrangement = new ConductorArrangement(1, 5, conductorProperties[0]);
    expect(arrangement.strandArrangement).toEqual([{ r: 0, theta: 0, radius: 5, properties: conductorProperties[0] }]);
  });

  it('should create a valid arrangement matrix for two strands', () => {
    const arrangement = new ConductorArrangement(2, 5, conductorProperties[0]);
    expect(arrangement.strandArrangement).toEqual([
      { r: 5, theta: 0, radius: 5, properties: conductorProperties[0] },
      { r: 5, theta: Math.PI, radius: 5, properties: conductorProperties[0] }
    ]);
  });

  it('should create a valid arrangement matrix for three strands', () => {
    const arrangement = new ConductorArrangement(3, 5, conductorProperties[0]);
    const rad = 5 / Math.sqrt(3);
    expect(arrangement.strandArrangement).toEqual([
      { r: rad, theta: 0, radius: 5, properties: conductorProperties[0] },
      { r: rad, theta: (2 * Math.PI) / 3, radius: 5, properties: conductorProperties[0] },
      { r: rad, theta: 2 * (2 * Math.PI) / 3, radius: 5, properties: conductorProperties[0] }
    ]);
  });

  it('should call packLayer with correct values in sequence for unsupported number of strands in the first layer', () => {

    const arrangement = new ConductorArrangement(4, 5, conductorProperties[0]);
    expect(arrangement.strandArrangement).toEqual([
      { r: 5 * Math.sqrt(8), theta: 0, radius: 5, properties: conductorProperties[0] },
      { r: 5 * Math.sqrt(8), theta: Math.PI / 2, radius: 5, properties: conductorProperties[0] },
      { r: 5 * Math.sqrt(8), theta: Math.PI, radius: 5, properties: conductorProperties[0] },
      { r: 5 * Math.sqrt(8), theta: (3 * Math.PI) / 2, radius: 5, properties: conductorProperties[0] }
    ]);
  });

  it('should correctly pack multiple layers', () => {
    const arrangement = new ConductorArrangement(19, 5, conductorProperties[0]);
    expect(arrangement.strandArrangement.length).toBe(19);
  });

  it('should call packLayer for atypical strand', () => {
    const spy = jest.spyOn(ConductorArrangement.prototype as any, 'packLayer');
    const arrangement = new ConductorArrangement(13, 5, conductorProperties[0]);

    expect(arrangement.strandArrangement.length).toBe(13);

    // Verify the sequence of calls to packLayer
    expect(spy).toHaveBeenNthCalledWith(1, 0, 13, 5); // First call
    expect(spy).toHaveBeenNthCalledWith(2, 10, 12, 5);  // Second call (example, adjust based on logic)
    expect(spy).toHaveBeenNthCalledWith(3, 20, 6, 5);
    spy.mockRestore();
  });

  describe('Derived Values, GMR and Resistance', () => {
    it('should calculate GMR and resistance for a single strand', () => {
      const spyGroup = jest.spyOn(ConductorArrangement.prototype as any, 'groupedResistivity');
      const arrangement = new ConductorArrangement(1, 5, conductorProperties[0]);

      const gmr = arrangement.gmr();
      expect(gmr).toBeCloseTo(5* Math.exp(-0.25), 3);

      expect(arrangement.groupedResistivity()[0].totalSurfaceArea).toBeCloseTo(
        78.5398, 3
      );

      const resistanceFn  = arrangement.resistivityFunction()
      expect(resistanceFn(20)).toBeCloseTo(0.0000000168, 3);
      expect(resistanceFn(30)).toBeCloseTo(0.000000017, 3);

      spyGroup.mockRestore();
    });

    it('should calculate GMR and resistance for multiple strands', () => {
      const arrangement = new ConductorArrangement(37, 0.0021, conductorProperties[0]);

      const gmr = arrangement.gmr();
      expect(gmr).toBeCloseTo(0.0112, 3);

      const groupedResistivity = arrangement.groupedResistivity();
      expect(groupedResistivity.length).toBe(1);
      expect(groupedResistivity[0].totalSurfaceArea).toBeCloseTo(0.00051, 3);
      expect(groupedResistivity[0].resistivity).toBeCloseTo(0.0000000168, 3);
      expect(groupedResistivity[0].temp_coef_of_resistivity).toBeCloseTo(0.00393, 3);

      const resistanceFn  = arrangement.resistivityFunction()
      
      expect(resistanceFn(20)).toBeCloseTo(0.0000000168/0.00051, 3);
      expect(resistanceFn(30)).toBeCloseTo((0.0000000168/0.00051)*0.00393*(1+10), 3);
    });
  });
});

describe('ConductorArrangementCore', () => {
  it('should return a valid core arrangement for a single strand core', () => {
    const spyCore = jest.spyOn(ConductorArrangement.prototype, 'GetArrangementMatrix');
    const spyPack = jest.spyOn(ConductorArrangementCore.prototype as any, 'packLayer');

    const arrangement = new ConductorArrangementCore(6, 2, 1, 3, conductorProperties[0], conductorProperties[1]);

    expect(spyCore).toHaveBeenCalledWith(1, 3);
    expect(spyPack).toHaveBeenCalledWith(5, 6, 2 );

    spyCore.mockRestore();
    spyPack.mockRestore();
  });
  
  it ('should return a valid core arrangement for multiple strands', () => {
    const spyPack = jest.spyOn(ConductorArrangementCore.prototype as any, 'packLayer');
    const arrangement = new ConductorArrangementCore(19, 2, 1, 3, conductorProperties[0], conductorProperties[1]);

    expect(spyPack).toHaveBeenNthCalledWith(1, 5, 19, 2);
    expect(spyPack).toHaveBeenNthCalledWith(2, 9, 12, 2);

    spyPack.mockRestore();
  });


  it('should handle edge case for only core strands', () => {
    const arrangement = new ConductorArrangementCore(0, 5, 3, 5, conductorProperties[0], conductorProperties[1]);

    expect(arrangement.strandArrangement.length).toEqual(3);
  });

  it('should correctly handle edge case only outer strands', () => {
    const arrangement = new ConductorArrangementCore(19, 5, 0, 5, conductorProperties[0], conductorProperties[1]);
    expect(arrangement.strandArrangement.length).toEqual(19);


  });
});