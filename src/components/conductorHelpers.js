// Helper functions for creating conductors from data
import { SolidConductor, StrandedConductor } from './conductor/conductorModel.ts';

/**
 * Create a conductor from conductor data and properties
 * @param {Object} condData - Conductor data (from conductorData.json)
 * @param {Object} properties - Material properties (from conductorProperties.json)
 * @returns {SolidConductor | StrandedConductor}
 */
export function createConductor(condData, properties, coreProperties = null) {
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
      condData?.core_strand_count,
      condData?.core_strand_dia ? (condData.core_strand_dia / 1000) / 2 : undefined,
      coreProperties || properties,
      outerRadiusM
    );
  }
}

/**
 * Create default conductor arrangements
 * @returns {Array} Array of default conductors
 */
export function createDefaultConductors(count=1, conductorData, conductorProperties) {
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
export function getConductorDataByName(name, conductorData) {
  return conductorData.find(c => c.name === name);
}

/**
 * Get properties by type
 * @param {string} type - Material type
 * @returns {Object} Properties object
 */
export function getPropertiesByType(type, conductorProperties) {
  return conductorProperties.find(p => p.type === type);
}
