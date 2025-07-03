import { permeability_of_free_space } from './constants.js';

export function calculateSkinDepth(frequency, resistivity, rel_permeability = 1) {
  // Calculate skin depth in meters
  const skinD= Math.sqrt(resistivity / (Math.PI * frequency * rel_permeability * permeability_of_free_space));
  return skinD
}