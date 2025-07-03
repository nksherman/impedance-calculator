// src/calculators/rlcCalculator.js
/**
 * Calculates RLC values for given conductor arrangements.
 * @param {Conductor[]} conductorArrangements - Array of conductor objects
 * @param {Conductor[]|string} neutralArrangement - Neutral conductor object or empty string
 * @param {number} frequency - Frequency in Hz
 * @param {number} temperature - Temperature in Celsius
 * @param {number} gmd_mm - Geometric Mean Distance in mm
 * @returns {Object} { rlcResults, totalXlpk, totalXcpk, neutralResistance }
 */
export function calculateRLC(frequency, temperature, gmd_mm, conductorArrangements, neutralArrangement = "", calculateSkinEffect = true ) {
  const gmd_m = gmd_mm / 1000; // Convert mm to m

  let skinFreq = frequency;
  if (!calculateSkinEffect) {
    skinFreq = 0
  }

  // early handle frequency = 0 (DC circuit)
  if (frequency === 0) {
    const rlcResults = conductorArrangements.map(conductor => ({
      R: conductor.resistanceFn()(temperature) * 1000, // ohms per km
      L: 0, // H/m
      C: 0, // F/m
    }));
    return {
      rlcResults,
      rpk: rlcResults.map(res => res.R), // ohms per km
      totalXlpk: 0,
      totalXcpk: 0,
      neutralResistance: neutralArrangement ? neutralArrangement.resistanceFn()(temperature) * 1000 : 0,
    };
  }

  // early handle gmd = 0 (degenerate case)
  if (
    gmd_mm === 0 &&
    conductorArrangements.length === 1 &&
    !neutralArrangement
  ) {
    const conductor = conductorArrangements[0];

    const resFn = conductor.resistanceFn();
    const indFn = conductor.inductanceFn();
    const capFn = conductor.capacitanceFn();
    const R = resFn(temperature, skinFreq); // conditionally apply skin effect
    const L = indFn(gmd_m);
    const C = capFn(gmd_m);

    const omega = 2 * Math.PI * frequency;
    const xlpk = frequency ? omega * L : 0; // ohms per km
    const xcpk = frequency ? 1 / (omega * C) : 0; // ohms per km
    return {
      rlcResults: [{ R, L, C }],
      rpk: [R * 1000], // ohms per km
      totalXlpk: xlpk,
      totalXcpk: xcpk,
      neutralResistance: 0,
    };
  }

  const results = conductorArrangements.map((conductor) => {
    const resFn = conductor.resistanceFn();
    const indFn = conductor.inductanceFn();
    const capFn = conductor.capacitanceFn();
    const R = resFn(temperature, skinFreq);
    const L = indFn(gmd_m); // H/m
    const C = capFn(gmd_m); // F/m
    return { R, L, C };
  });

  const L_max = Math.max(...results.map(res => res.L));
  const C_max = Math.max(...results.map(res => res.C));
  const omega = 2 * Math.PI * frequency;
  const xl_tot = omega * L_max;
  const cl_tot = 1 / (omega * C_max);

  let neutralResistance = 0;
  if (neutralArrangement !== "") {
    const resFn = neutralArrangement.resistanceFn();
    const R = resFn(temperature, frequency);
    neutralResistance = R * 1000; // ohms per km
  }

  return {
    rlcResults: results,
    rpk: results.map(res => res.R * 1000), // ohms per km
    totalXlpk: xl_tot * 1000, // ohms per 1000 m
    totalXcpk: cl_tot * 1000,
    neutralResistance,
  };
}
