export type ConductorProperties = {
  type: string; // Type of conductor (e.g., "copper", "aluminum")
  temp_reference: number; // Reference temperature in Celsius
  resistivity: number; // Resistivity in ohm-meters
  temp_coef_of_resistivity: number; // Temperature coefficient of resistivity in 1/Celsius
  permeability_relative: number; // Relative permeability
  conductivity: number; // Conductivity in S/m
}

export type ConductorData = {
  name: string; // Name of the conductor
  strand_count: number; // Number of strands in the conductor
  stand_dia: number; // Diameter of a single strand in mm
  outer_dia: number; // Outer diameter of the conductor in mm
}

export type insulatorType = {
  type: string; // Type of insulator (e.g., "XLPE", "PVC")
  dielectric_strength: number; // Dielectric strength in kV/mm
  relative_permittivity: number; // Relative permittivity
  thermal_conductivity: number; // Thermal conductivity in W/mK
  density: number; // Density in kg/m^3
}

export type CompleteConductor = {
  conductor: ConductorData; // Conductor data
  properties: ConductorProperties; // Conductor properties
  core_conductor: ConductorData; // core conductor data
  core_properties: ConductorProperties; //  core conductor properties
  insulator?: insulatorType; // Optional insulator data
  arrangement?: { r: number; theta: number; radius: number }[]; // Optional arrangement of strands
}