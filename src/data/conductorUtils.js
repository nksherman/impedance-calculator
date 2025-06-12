import conductorData from './conductorData.json';
import conductorProperties from './conductorProperties.json';

export function getRadiusValue(cond) {
  try {
    // Use half the outer diameter as radius
    return conductorData[cond].outer_diam / 2;
  } catch (error) {
    console.error('Error in getRadiusValue:', error);
    return null;
  }
}