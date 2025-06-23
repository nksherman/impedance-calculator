export interface ConductorProperties {
  type: string; // Type of conductor (e.g., "copper", "aluminum")
  temp_reference: number; // Reference temperature in Celsius
  resistivity: number; // Resistivity in ohm-meters
  temp_coef_of_resistivity: number; // Temperature coefficient of resistivity in 1/Celsius
  permeability_relative: number; // Relative permeability
  conductivity: number; // Conductivity in S/m
}

export interface RadialCoordinate {
  r: number; // radius
  theta: number; // angle in radians
  radius: number; // radius for the strand
} 

export interface RadialConductor extends RadialCoordinate {
  properties: ConductorProperties; // Optional properties for the conductor
}


export interface ConductorData {
  name: string; // Name of the conductor
  strand_count: number; // Number of strands in the conductor
  stand_dia: number; // Diameter of a single strand in mm
  outer_dia: number; // Outer diameter of the conductor in mm
}

export interface ConductorDataWithCore extends ConductorData {
  core_strand_count: number; // Number of strands in the core conductor
  core_stand_dia: number; // Diameter of a single strand in the core conductor
}

export interface insulatorType {
  type: string; // Type of insulator (e.g., "XLPE", "PVC")
  dielectric_strength: number; // Dielectric strength in kV/mm
  relative_permittivity: number; // Relative permittivity
  thermal_conductivity: number; // Thermal conductivity in W/mK
  density: number; // Density in kg/m^3
}

