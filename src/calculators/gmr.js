/**
 * Calculate the GMR (Geometric Mean Radius) for a single solid conductor.
 * @param {number} r_m - The physical radius of the conductor (in meters).
 * @returns {number} - The GMR of the conductor (in meters).
 */
export function gmrSingle(r_m) {
  
  return r_m * Math.exp(-0.25);
}

/**
 * Calculate the GMR for a stranded conductor using the distance matrix.
 * @param {number[][]} distanceMatrix - A 2D array where distanceMatrix[i][j] is the distance (in meters) between strand i and strand j.
 * @returns {number} - The GMR of the stranded conductor (in meters).
 */
export function gmrStranded(distanceMatrix) {
  const n = distanceMatrix.length;
  if (n === 0) return 0;

  const logMatrix = distanceMatrix.map(row => row.map(d => Math.log(d)));
  const logSum = logMatrix.reduce((acc, row) => acc + row.reduce((sum, d) => sum + d, 0), 0);

  const result = Math.exp(logSum / (n * n));

  return result;
}

/**
 * Generic GMR calculator.
 * If given a radius, calculates for a single conductor.
 * If given a distance matrix, calculates for a set of strands.
 * @param {number|number[][]} input - Either a radius (meters) or a distance matrix (meters).
 * @returns {number} - The GMR (in meters).
 */
export function gmr(input) {
  if (typeof input === 'number') {
    return gmrSingle(input);
  } else if (Array.isArray(input) && input.length === 1 && typeof input[0] === 'number') {
    return gmrSingle(input[0]);
  } else if (Array.isArray(input)) {
    return gmrStranded(input);
  }
  throw new Error('Invalid input for GMR calculation');
}