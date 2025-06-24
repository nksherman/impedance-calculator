// Helper functions for creating conductors from data
import { SolidConductor, StrandedConductor } from './conductor/conductorModel.ts';
import conductorData from '../data/conductorData.json';
import conductorProperties from '../data/conductorProperties.json';

/**
 * Create a conductor from conductor data and properties
 * @param {Object} condData - Conductor data (from conductorData.json)
 * @param {Object} properties - Material properties (from conductorProperties.json)
 * @returns {SolidConductor | StrandedConductor}
 */
export function createConductor(condData, properties) {
  // Convert diameters from mm to meters
  const strandRadiusM = (condData.strand_dia / 1000) / 2;
  const outerRadiusM = (condData.outer_dia / 1000) / 2;

  if (condData.strand_count === 1) {
    // Solid conductor
    return new SolidConductor(
      condData.name,
      strandRadiusM,
      properties
    );
  } else {
    // Stranded conductor
    return new StrandedConductor(
      condData.name,
      condData.strand_count,
      strandRadiusM,
      properties,
      undefined, // no core strands
      undefined, // no core radius
      undefined, // no core properties
      outerRadiusM
    );
  }
}

/**
 * Create default conductor arrangements
 * @returns {Array} Array of default conductors
 */
export function createDefaultConductors(count=1) {
  const defaultConductorData = conductorData[0]; // First conductor in the list
  const defaultProperties = conductorProperties[0]; // First material (usually copper)

  // Create an array of conductors with the specified count
  return Array(count).fill(null).map(() => 
    createConductor(defaultConductorData, defaultProperties)
  );
}

/**
 * Get conductor data by name
 * @param {string} name - Conductor name
 * @returns {Object} Conductor data object
 */
export function getConductorDataByName(name) {
  return conductorData.find(c => c.name === name);
}

/**
 * Get properties by type
 * @param {string} type - Material type
 * @returns {Object} Properties object
 */
export function getPropertiesByType(type) {
  return conductorProperties.find(p => p.type === type);
}
