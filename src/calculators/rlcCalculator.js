// src/calculators/rlcCalculator.js

const permeability_of_free_space = 4 * Math.PI * 0.0000001; // H/m
const permissivity_free_space = 8.854 * 0.000000000001; // F/m

/**
 * Calculates RLC values for given conductor arrangements.
 * @param {Conductor[]} conductorArrangements - Array of conductor objects
 * @param {Conductor[]|string} neutralArrangement - Neutral conductor object or empty string
 * @param {number} frequency - Frequency in Hz
 * @param {number} temperature - Temperature in Celsius
 * @param {number} gmd_mm - Geometric Mean Distance in mm
 * @returns {Object} { rlcResults, totalXlpk, totalXcpk, neutralResistance }
 */
export function calculateRLC(frequency, temperature, gmd_mm, conductorArrangements, neutralArrangement = "" ) {
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
    const GMR = conductor.gmr();
    const r_m = conductor.circumscribedRadius();
    const resFn = conductor.resistanceFn();
    const R = resFn(temperature);
    const L = 0;
    const C = (2 * Math.PI * permissivity_free_space) / Math.log(GMR / r_m);
    const xcpk = frequency ? 1 / (2 * Math.PI * frequency * C) : 0; // ohms per km
    return {
      rlcResults: [{ R, L, C }],
      rpk: [R * 1000], // ohms per km
      totalXlpk: 0,
      totalXcpk: xcpk,
      neutralResistance: 0,
    };
  }

  const gmd_m = gmd_mm / 1000; // Convert mm to m
  const results = conductorArrangements.map((conductor) => {
    const r_m = conductor.circumscribedRadius();
    const permeabilityRelative = conductor.effectivePermeability();
    const resFn = conductor.resistanceFn();
    const GMR = conductor.gmr();
    const R = resFn(temperature);
    const L = permeabilityRelative * permeability_of_free_space / (2 * Math.PI) * Math.log(gmd_m / GMR); // H/m
    const C = (2 * Math.PI * permissivity_free_space) / Math.log(gmd_m / r_m); // F/m
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
    const R = resFn(temperature);
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
