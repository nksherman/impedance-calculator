import React, { useState } from 'react';
import { Box, Select, MenuItem, TextField, Button, Typography, InputLabel, FormControl, FilledInput, InputAdornment } from '@mui/material';

import DistanceMatrix from './components/distanceMatrix';
import ConductorInput from './components/conductorInput';

import './App.css';

const conductorData = [ //mm
  { name: '1 AWG', strand_count: 1, strand_dia: 7.34822, outer_diam: 7.34822 }, 
  { name: '1/0 AWG', strand_count: 1, strand_dia: 8.25246, outer_diam: 8.25246 },
  { name: '2/0 AWG', strand_count: 1, strand_dia: 9.26592, outer_diam: 9.26592 },
  { name: '3/0 AWG', strand_count: 1, strand_dia: 10.040384, outer_diam: 10.40384 },
  { name: '4/0 AWG', strand_count: 1, strand_dia: 11.684, outer_diam: 11.684 },
  { name: '1-7 concentric', strand_count: 7, strand_dia: 2.7686, outer_diam: 8.3312 },
  { name: '1/0-7 concentric', strand_count: 7, strand_dia: 3.1242, outer_diam: 9.3472 },
  { name: '2/0-7 concentric', strand_count: 7, strand_dia: 3.5052, outer_diam: 10.5156 },
];

// TODO: Check all of these variables
const conductorProperties = [
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

const permeability_of_free_space = 4 * Math.PI * 1e-7; // H/m
const permissivity_free_space = 8.854e-12; // F/m



function App() {
  const [conductorIndices, setConductorIndices] = useState([0, 0, 0]);
  const [propertyIndices, setPropertyIndices] = useState([0, 0, 0]);

  const [frequency, setFrequency] = useState(60); // Default frequency in Hz
  const [totalRpk, setTotalRpk] = useState(0); // ohms per km
  const [totalXlpk, setTotalXlpk] = useState(0); // ohms per km
  const [totalXcpk, setTotalXcpk] = useState(0); // ohms per km

  const [gmd, setGmd] = useState(0); // mm 
  const [rlcResults, setRlcResults] = useState([null, null, null]);


  const getRadiusValue = (idx) => {
    // Use half the outer diameter as radius
    return conductorData[conductorIndices[idx]].outer_diam / 2;
  };

  const calculateRLC = (gmd_mm, frequency) => {
    let totalR = 0;

    const gmd_m = gmd_mm / 1000; // Convert mm to m
    console.log(frequency, gmd_m);

    const results = [0, 1, 2].map(idx => {
      const prop = conductorProperties[propertyIndices[idx]];
      const cond = conductorData[conductorIndices[idx]];
      const r_m = (cond.outer_diam / 2) /1000; // mm dia to m rad
      const area = Math.PI * r_m * r_m;
      const R = prop.resistivity / area; // Ω/m
      const GMR = r_m * Math.exp(-0.25);
      const L = prop.permeability_relative * permeability_of_free_space / (2*Math.Pi) * Math.log(gmd_m / GMR); // H/m
      const C = (Math.PI * permissivity_free_space) / Math.log(gmd_m / r_m); // F/m

      console.log(`Conductor ${idx + 1}: R=${R} Ω/m, L=${L} H/m, C=${C} F/m`);

      totalR += R;
      
      return {
        R: R, // all per/m
        L: L,
        C: C,
      };
    });
    setRlcResults(results);

    // L total is the maximum of individual inductances
    const L_max = Math.max(...results.map(res => res.L));
    // C total is the maximum of individual capacitances
    const C_max = Math.max(...results.map(res => res.C));

    // Calculate total reactance
    const omega = 2 * Math.PI * frequency; // Angular frequency

    const xl_tot = omega * L_max; // Inductive reactance
    const cl_tot = 1/(omega * C_max); // Capacitive reactance

    // resistance and reactance should be per 1000 meter
    const totalRpk = totalR * 1000; // Total resistance in ohms per 1000 m

    setTotalRpk(totalRpk);
    setTotalXlpk(xl_tot * 1000); // Convert to ohms per 1000 m
    setTotalXcpk(cl_tot * 1000); // Convert to ohms per 1000 m
  };


  return (
    <Box className="App" sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Geometric Mean Distance Calculator</Typography>
      <ConductorInput
        conductorData={conductorData}
        conductorProperties={conductorProperties}
        conductorIndices={conductorIndices}
        setConductorIndices={setConductorIndices}
        propertyIndices={propertyIndices}
        setPropertyIndices={setPropertyIndices}
      />
      <DistanceMatrix
        gmd={gmd}
        setGmd={setGmd}
        getRadiusValue={getRadiusValue}
        conductorIndices={conductorIndices}
      />

      <FilledInput
        value={frequency}
        onChange={(e) => {
          const freq = parseFloat(e.target.value);
          if (isNaN(freq) || freq <= 0) {
            setFrequency('Invalid frequency');
          } else {
            setFrequency(freq);
          }
        }}
        endAdornment={<InputAdornment position="end">Hz</InputAdornment>}
        sx={{ mt: 2, mb: 2, width: 200 }}
        inputProps={{
          'aria-label': 'frequency',
          type: 'number',
          min: 0,
          step: 1,
        }}
      />

      <Button variant="contained" sx={{ mt: 2 }} onClick={() => calculateRLC(gmd, frequency)}>Calculate RLC</Button>
      {rlcResults[0] && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Per-unit-length values:</Typography>
          {[0, 1, 2].map(idx => (
            <Box key={idx} sx={{ mb: 1 }}>
              <Typography variant="subtitle1">
                Conductor {idx + 1} ({conductorData[conductorIndices[idx]].name}, {conductorProperties[propertyIndices[idx]].type})
              </Typography>
              <Typography variant="body2">
                Resistance R: {rlcResults[idx].R*1000} Ω/m ({(rlcResults[idx].R * 304.8).toFixed(4)}Ω/kft)
              </Typography>
              <Typography variant="body2">Inductance L: {rlcResults[idx].L} H/km</Typography>
              <Typography variant="body2">Capacitance C: {rlcResults[idx].C} F/km</Typography>
            </Box>
          ))}
          <Typography variant="h6" sx={{ mt: 2 }}>Total Values:</Typography>
          <Typography variant="body1">
            Total Resistance XL<sub>pk</sub>: {totalXlpk} Ω/1000m ({(totalXlpk * 0.3048).toFixed(4)} Ω/1000ft)
          </Typography>
          <Typography variant="body1">
            Total Resistance XC<sub>pk</sub>: {totalXcpk} Ω/1000m ({(totalXcpk * 0.3048).toFixed(4)} Ω/1000ft)
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default App;