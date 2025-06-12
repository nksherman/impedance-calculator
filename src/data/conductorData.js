export const conductorProperties = [
  {
    type: 'Copper',
    resistivity: 0.0000000168, // ohm-m
    temp_coef_of_resistivity: 0.00393, // per degree Celsius
    permeability_relative: 0.999994,
    conductor_conductivity: 58.0, // S/m
  },
  {
    type: 'Aluminum',
    resistivity: 0.0000000282, // ohm-m
    temp_coef_of_resistivity: 0.0039, // per degree Celsius
    permeability_relative: 1.000022, // relative permeability
    conductor_conductivity: 35.0, // S/m
  },
]


export const conductorData = [ //mm
  { name: '1 AWG', strand_count: 1, strand_dia: 7.34822, outer_diam: 7.34822 }, 
  { name: '1/0 AWG', strand_count: 1, strand_dia: 8.25246, outer_diam: 8.25246 },
  { name: '2/0 AWG', strand_count: 1, strand_dia: 9.26592, outer_diam: 9.26592 },
  { name: '3/0 AWG', strand_count: 1, strand_dia: 10.040384, outer_diam: 10.40384 },
  { name: '4/0 AWG', strand_count: 1, strand_dia: 11.684, outer_diam: 11.684 },
  { name: '1-7 concentric', strand_count: 7, strand_dia: 2.7686, outer_diam: 8.3312 },
  { name: '1/0-7 concentric', strand_count: 7, strand_dia: 3.1242, outer_diam: 9.3472 },
  { name: '2/0-7 concentric', strand_count: 7, strand_dia: 3.5052, outer_diam: 10.5156 },
];

// functions working with this data

export function getRadiusValue(cond) {
  try {
    // Use half the outer diameter as radius
    return conductorData[cond].outer_diam / 2;
  } catch (error) {
    console.error('Error in getRadiusValue:', error);
    return null; // or handle as appropriate
  }
}