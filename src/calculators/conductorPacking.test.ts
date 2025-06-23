import { ConductorProperties } from '../data/conductorInterface';
import { packLayer, packStrandedConductorWithCore, packStrandedConductor } from './conductorPacking';

const copper: ConductorProperties = {
  type: "Copper",
  temp_reference: 20,
  resistivity: 0.0000000168,
  temp_coef_of_resistivity: 0.00393,
  permeability_relative: 0.999994,
  conductivity: 58.0
};

describe('packLayer', () => {
  it('should return a single strand at the center if circumCore is 0 and strands is 1', () => {
    const result = packLayer(0, 1, 5, copper);
    expect(result).toEqual([{ r: 0, theta: 0, radius: 5, properties: copper }]);
  });

  it('should pack a full layer of 6 strands around 1 strand core', () => {
    const result = packLayer(0, 7, 2, copper);
    expect(result.length).toBe(7);
    // one should be at r==1
    expect(result[0].r).toBe(0);
    // the rest should be at r==4
    result.slice(1).forEach(strand => {
      expect(strand.r).toBe(4);
      expect(strand.radius).toBe(2);
      expect(strand.properties).toBe(copper);
    });

  });

  it('should pack multiple layers if strands > can fit in one layer', () => {
    // For radius 1, circumCore 0, first layer can fit floor(2π*1/2) = 3 strands, next layer...
    const result = packLayer(0, 10, 1, copper);
    expect(result.length).toBe(10);
    // Should have at least two different r values (layers)
    const uniqueR = Array.from(new Set(result.map(s => s.r)));
    expect(uniqueR.length).toBeGreaterThan(1);
  });

  it('should pack around a nonzero circumCore', () => {
    const result = packLayer(5, 4, 1, copper);
    expect(result.length).toBe(4);
    result.forEach(strand => {
      expect(strand.r).toBeGreaterThan(0);
      expect(strand.radius).toBe(1);
      expect(strand.properties).toBe(copper);
    });
  });

  it('should return empty array for zero strands', () => {
    const result = packLayer(0, 0, 2, copper);
    expect(result).toEqual([]);
  });

  it('should handle negative strands gracefully (return empty)', () => {
    const result = packLayer(0, -5, 2, copper);
    expect(result).toEqual([]);
  });

  it('should handle very large number of strands', () => {
    const result = packLayer(0, 1000, 1, copper);
    expect(result.length).toBe(1000);
  });
});

describe('packStrandedConductorWithCore', () => {
  const copper: ConductorProperties = {
    type: "Copper",
    temp_reference: 20,
    resistivity: 0.0000000168,
    temp_coef_of_resistivity: 0.00393,
    permeability_relative: 0.999994,
    conductivity: 58.0
  };
  const aluminum: ConductorProperties = {
    type: "Aluminum",
    temp_reference: 20,
    resistivity: 0.0000000278,
    temp_coef_of_resistivity: 0.00403,
    permeability_relative: 1.000022,
    conductivity: 36.9
  };

  it('should return empty array for zero strands', () => {
    const result = packStrandedConductorWithCore(0, 2, 1, 1, copper, aluminum);
    expect(result).toEqual([]);
  });

  it('should pack core and outer strands correctly', () => {
    const result = packStrandedConductorWithCore(6, 1, 1, 1, copper, aluminum);
    // 1 core + 6 outer
    expect(result.length).toBe(7);
    // Core should have aluminum properties
    expect(result[0].properties).toBe(aluminum);
    // Outer should have copper properties
    result.slice(1).forEach(strand => {
      expect(strand.properties).toBe(copper);
    });
  });

  it('should handle multiple core strands', () => {
    const result = packStrandedConductorWithCore(6, 1, 3, 1, copper, aluminum);
    // 3 core + 6 outer

    expect(result.length).toBe(9);
    result.slice(0, 3).forEach(strand => {
      expect(strand.properties).toBe(aluminum);
    });
    result.slice(3).forEach(strand => {
      expect(strand.properties).toBe(copper);
    });
  });

  it('should handle no core strands (coreStrands=0)', () => {
    const result = packStrandedConductorWithCore(5, 1, 0, 1, copper, aluminum);
    expect(result.length).toBe(5);
    result.forEach(strand => {
      expect(strand.properties).toBe(copper);
    });
  });
});

describe('packStrandedConductor', () => {
  const copper: ConductorProperties = {
    type: "Copper",
    temp_reference: 20,
    resistivity: 0.0000000168,
    temp_coef_of_resistivity: 0.00393,
    permeability_relative: 0.999994,
    conductivity: 58.0
  };

  it('should return empty array for zero strands', () => {
    const result = packStrandedConductor(0, 2, copper);
    expect(result).toEqual([]);
  });

  it('should pack a single strand at center', () => {
    const result = packStrandedConductor(1, 2, copper);
    expect(result.length).toBe(1);
    expect(result[0].r).toBe(0);
    expect(result[0].radius).toBe(2);
    expect(result[0].properties).toBe(copper);
  });

  it('should pack 7 strands in close-packed pattern', () => {
    const result = packStrandedConductor(7, 1, copper);
    expect(result.length).toBe(7);
    // Should have 1 at center, 6 around
    const center = result.find(s => s.r === 0);
    expect(center).toBeDefined();
    const outer = result.filter(s => s.r !== 0);
    expect(outer.length).toBe(6);
    outer.forEach(strand => {
      expect(strand.radius).toBe(1);
      expect(strand.properties).toBe(copper);
    });
  });

  it('should pack more than one layer for large number of strands', () => {
    const result = packStrandedConductor(20, 1, copper);
    expect(result.length).toBe(20);
    // Should have at least two different r values
    const uniqueR = Array.from(new Set(result.map(s => s.r)));
    expect(uniqueR.length).toBeGreaterThan(1);
  });

  it('should assign properties to all strands', () => {
    const result = packStrandedConductor(5, 2, copper);
    result.forEach(strand => {
      expect(strand.properties).toBe(copper);
    });
  });

  it('should handle negative strands gracefully (return empty)', () => {
    const result = packStrandedConductor(-3, 2, copper);
    expect(result).toEqual([]);
  });

  it('should handle very large number of strands', () => {
    const result = packStrandedConductor(1000, 1, copper);
    expect(result.length).toBe(1000);
  });
});