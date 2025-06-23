/**
 * Calculate steady-state conductor temperature.
 * @param {number} R - Resistance per unit length (Ω/m)
 * @param {number} V - Applied voltage (V)
 * @param {number} h - Convective heat transfer coefficient (W/m²K)
 * @param {number} D - Conductor diameter (m)
 * @param {number} T_ambient - Ambient temperature (°C)
 * @param {number} S - Solar intensity (W/m²)
 * @param {number} absorptivity - Surface absorptivity (0-1)
 * @returns {number} Final conductor temperature (°C)
 */
export function calculateConductorTemperature({
  Rpk,
  Vapplied,
  hConvectiveAir,
  dia,
  tAmbient,
  solarIntensity,
  absorptivity = 0.5,
  AC = true, // AC or DC current
}) {
  // Surface area per meter
  const A_surface = Math.PI * dia;
  const A_surface_half = A_surface / 2; // Half surface area for sun

  // Joule heating per meter

  const Vrms = AC ? Vapplied / Math.sqrt(2) : Vapplied; // RMS voltage for AC
  const Q_joule = Vrms * Vrms / Rpk;


  // Solar heating per meter
  const Q_solar = solarIntensity * absorptivity * A_surface_half;

  // Total heat input per meter
  const Q_total = Q_joule + Q_solar;

  // Convective cooling per meter per K
  const Q_conv_per_K = hConvectiveAir * A_surface;

  // ΔT = Q_total / Q_conv_per_K
  const deltaT = Q_conv_per_K > 0 ? Q_total / Q_conv_per_K : 0;

  console.log(`Joule heating per meter: ${Q_joule} W/m`);
  console.log(`Solar heating per meter: ${Q_solar} W/m`);
  console.log(`Total heat input per meter: ${Q_total} W/m`);
  console.log(`Convective cooling per meter per K: ${Q_conv_per_K} W/m/K`);
  console.log(`Temperature rise (ΔT): ${deltaT} K`);
  // Final temperature
  console.log(`Ambient temperature: ${tAmbient} °C`);
  console.log(`Final conductor temperature: ${tAmbient + deltaT} °C`);

  return tAmbient + deltaT;
}