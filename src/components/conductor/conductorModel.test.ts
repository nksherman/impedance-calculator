import { SolidConductor, StrandedConductor } from './conductorModel';

// src/components/conductor/conductorModel.test.ts

const copper = {
  type: "Copper",
  temp_reference: 20,
  resistivity: 0.0000000168,
  temp_coef_of_resistivity: 0.00393,
  permeability_relative: 0.999994,
  conductivity: 58.0
};

const aluminum = {
  type: "Aluminum",
  temp_reference: 20,
  resistivity: 0.0000000282,
  temp_coef_of_resistivity: 0.0039,
  permeability_relative: 1.000022,
  conductivity: 35.0
};


describe('SolidConductor', () => {
  it('should create a solid conductor with correct properties', () => {
    const sc = new SolidConductor("test1", 0.01, copper);
    expect(sc.circumscribedRadius()).toBeCloseTo(0.01, 6);
    expect(sc.surfaceArea()).toBeCloseTo(Math.PI * 0.01 * 0.01, 6);
    expect(sc.weightedProperties()).toEqual([
      expect.objectContaining({ type: 'Copper', weight_percent: 100 })
    ]);
  });

  it('should calculate resistanceFn correctly', () => {
    const sc = new SolidConductor("test2", 0.01, copper);
    const fn = sc.resistanceFn();
    const r20 = fn(20);
    const r30 = fn(30);
    expect(r20).toBeCloseTo(0.0000000168 / (Math.PI * 0.01 * 0.01), 8);
    expect(r30).toBeCloseTo(0.0000000168 / (Math.PI * 0.01 * 0.01) * Math.pow(1 + 0.00393 * (30 - 20), 1), 8);
  });

  it('should calculate gmr correctly', () => {
    const sc = new SolidConductor("test3", 0.01, copper);
    expect(sc.gmr()).toBeCloseTo(0.01 * Math.exp(-0.25), 6);
  });
});


describe('StrandedConductor', () => {
  it('should create a single strand arrangement matching SolidConductor', () => {
    const sc = new StrandedConductor('single', 1, 0.01, copper);
    expect(sc['arrangement'].length).toBe(1);
    expect(sc.circumscribedRadius()).toBeCloseTo(0.01, 6);
    expect(sc.surfaceArea()).toBeCloseTo(Math.PI * 0.01 * 0.01, 6);
    expect(sc.weightedProperties()).toEqual([
      expect.objectContaining({ type: 'Copper', weight_percent: 100 })
    ]);
  });

  it('should behave identically to SolidConductor when only one strand', () => {
    const solid = new SolidConductor('solid', 0.01, copper);
    const stranded = new StrandedConductor('stranded', 1, 0.01, copper);

    const arrangement = stranded['arrangement'];

    expect(stranded.circumscribedRadius()).toBeCloseTo(solid.circumscribedRadius(), 8);
    expect(stranded.surfaceArea()).toBeCloseTo(solid.surfaceArea(), 8);
    expect(stranded.weightedProperties()).toEqual(solid.weightedProperties());
    expect(stranded.gmr()).toBeCloseTo(solid.gmr(), 8);

    const sFn = solid.resistanceFn();
    const stFn = stranded.resistanceFn();
    expect(stFn(20)).toBeCloseTo(sFn(20), 8);
    expect(stFn(50)).toBeCloseTo(sFn(50), 8);
  });

  it('should create a valid arrangement for multiple strands', () => {
    const sc = new StrandedConductor('multi', 7, 0.005, copper);
    expect(sc['arrangement'].length).toBe(7);
    expect(sc.circumscribedRadius()).toBeGreaterThan(0.005);
    expect(sc.surfaceArea()).toBeCloseTo(7 * Math.PI * 0.005 * 0.005, 6);
    expect(sc.weightedProperties()).toEqual([
      expect.objectContaining({ type: 'Copper', weight_percent: 100 })
    ]);
  });

  it('should create a valid arrangement with core and outer strands', () => {
    const sc = new StrandedConductor('core+outer', 6, 0.002, copper, 1, 0.003, aluminum);
    expect(sc['arrangement'].length).toBe(7);
    const types = sc['arrangement'].map(s => s.properties.type);
    expect(types.filter(t => t === 'Copper').length).toBe(6);
    expect(types.filter(t => t === 'Aluminum').length).toBe(1);
    const weights = sc.weightedProperties();
    expect(weights.length).toBe(2);
    expect(weights.map(w => w.type)).toContain('Copper');
    expect(weights.map(w => w.type)).toContain('Aluminum');
    expect(weights.reduce((sum, w) => sum + w.weight_percent, 0)).toBeCloseTo(100, 5);
  });

  it('should handle only outer strands', () => {
    const sc = new StrandedConductor('outerOnly', 5, 0.002, copper, 0, 0.003, aluminum);
    expect(sc['arrangement'].length).toBe(5);
    expect(sc.weightedProperties().length).toBe(1);
    expect(sc.weightedProperties()[0].type).toBe('Copper');
  });

  it('should calculate resistanceFn for single material', () => {
    const sc = new StrandedConductor('resist', 3, 0.01, copper);
    const fn = sc.resistanceFn();
    const r20 = fn(20);
    const r30 = fn(30);
    expect(r20).toBeCloseTo( 0.0000000168 / ( 3 * Math.PI * 0.01 * 0.01), 8);
    expect(r30).toBeCloseTo(0.0000000168 / (3 * Math.PI * 0.01 * 0.01) * Math.pow(1 + 0.00393 * (30 - 20), 1), 8);
  });

  it('should calculate resistanceFn for mixed materials', () => {
    const sc = new StrandedConductor('resist-mix', 2, 0.002, copper, 2, 0.002, aluminum);
    const fn = sc.resistanceFn();
    const r20 = fn(20);
    const r40 = fn(40);
    expect(r20).toBeLessThan(r40);
    expect(typeof r20).toBe('number');
  });

  it('should calculate gmr for single and multiple strands', () => {
    const sc1 = new StrandedConductor('gmr1', 1, 0.01, copper);
    const sc7 = new StrandedConductor('gmr7', 7, 0.005, copper);
    expect(sc1.gmr()).toBeCloseTo(0.01 * Math.exp(-0.25), 6);
    expect(sc7.gmr()).toBeGreaterThan(0);
  });

  it('should throw or handle invalid input gracefully', () => {
    expect(() => new StrandedConductor('bad', -1, 0.01, copper)).not.toThrow();
    expect(() => new StrandedConductor('bad2', 2, -0.01, copper)).not.toThrow();
  });
});