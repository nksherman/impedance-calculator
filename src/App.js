import React, { useState } from 'react';
import { Box, Select, MenuItem, TextField, Button, Typography, InputLabel, FormControl, FilledInput, InputAdornment } from '@mui/material';

import NeutralInput from './components/neutralInput';
import ConductorInput from './components/conductorInput';
import DistanceMatrix from './components/distanceMatrix';

import './App.css';

import { conductorProperties, conductorData } from './data/conductorData';

const permeability_of_free_space = 4 * Math.PI * 0.0000001; // H/m
const permissivity_free_space = 8.854*0.000000000001; // F/m

function App() {
  const [neutralIndex, setNeutralIndex] = useState(null); // Neutral conductor index
  const [neutralProperty, setNeutralProperty] = useState(0); // Neutral conductor property index

  const [conductorIndices, setConductorIndices] = useState([0, 0, 0]);
  const [propertyIndices, setPropertyIndices] = useState([0, 0, 0]);

  const [frequency, setFrequency] = useState(60); // Default frequency in Hz
  const [totalRpk, setTotalRpk] = useState(0); // ohms per km
  const [totalXlpk, setTotalXlpk] = useState(0); // ohms per km
  const [totalXcpk, setTotalXcpk] = useState(0); // ohms per km

  const [gmd, setGmd] = useState(0); // mm 
  const [rlcResults, setRlcResults] = useState([]);


  const calculateRLC = (gmd_mm, frequency) => {
    let totalR = 0;

    const gmd_m = gmd_mm / 1000; // Convert mm to m

    const results = conductorIndices.map((_, idx) => {
      const prop = conductorProperties[propertyIndices[idx]];
      const cond = conductorData[conductorIndices[idx]];
      const r_m = (cond.outer_diam / 2) /1000; // mm dia to m rad
      const area = Math.PI * r_m * r_m;
      const R = prop.resistivity / area; // Ω/m
      const GMR = r_m * Math.exp(-0.25);
      const L = prop.permeability_relative * permeability_of_free_space / (2*Math.PI) * Math.log(gmd_m / GMR); // H/m
      const C = (Math.PI * permissivity_free_space) / Math.log(gmd_m / r_m); // F/m

      totalR += R;
      
      return {
        R: R, // all per/m
        L: L,
        C: C,
      };
    });

    setRlcResults(results);

    // L/C is the maximum of the individual values
    const L_max = Math.max(...results.map(res => res.L));
    const C_max = Math.max(...results.map(res => res.C));

    const omega = 2 * Math.PI * frequency; // Angular frequency

    const xl_tot = omega * L_max;
    const cl_tot = 1/(omega * C_max);

    const totalRpk = totalR * 1000;

    setTotalRpk(totalRpk);
    setTotalXlpk(xl_tot * 1000); // Convert to ohms per 1000 m
    setTotalXcpk(cl_tot * 1000);
  };


  return (
    <Box className="App" sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Geometric Mean Distance Calculator</Typography>

      <NeutralInput
        neutralIndex={neutralIndex}
        setNeutralIndex={setNeutralIndex}
        neutralProperty={neutralProperty}
        setNeutralProperty={setNeutralProperty}
      />

      <Typography variant="h5" gutterBottom>Neut Vals</Typography>
      <Typography variant="body1">
        Neutral Conductor: {neutralIndex !== null ? conductorData[neutralIndex]?.name : 'None'} 
        {neutralIndex !== null ? ` (${conductorProperties[neutralProperty]?.type})` : ''}
      </Typography>

      <ConductorInput
        conductorIndices={conductorIndices}
        setConductorIndices={setConductorIndices}
        propertyIndices={propertyIndices}
        setPropertyIndices={setPropertyIndices}
      />
      <DistanceMatrix
        gmd={gmd}
        setGmd={setGmd}
        conductorIndices={conductorIndices}
        neutralIndex={neutralIndex}
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
      {frequency === 'Invalid frequency' && (
        <Typography color="error" data-testid="freq-error">
          Invalid frequency
        </Typography>
      )}

      <Button variant="contained" sx={{ mt: 2 }} onClick={() => calculateRLC(gmd, frequency)}>Calculate RLC</Button>
        <Box sx={{ mt: 3 }}>

          {conductorIndices.map((conIdx, idx) => {
            if (
              !rlcResults[idx] ||
              conductorIndices[idx] === undefined ||
              propertyIndices[idx] === undefined
            ) {
              return null
            };
            return (
              <Box key={idx} sx={{ mb: 1 }}>
                <Typography variant="h6">Per-unit-length values:</Typography>
                <Typography variant="subtitle1">
                  Conductor {idx + 1} ({conductorData[conductorIndices[idx]].name}, {conductorProperties[propertyIndices[idx]].type})
                </Typography>
                <Typography variant="body2">
                  Resistance R: {(rlcResults[idx].R * 1000).toFixed(3)} Ω/km ({(rlcResults[idx].R * 304.8).toFixed(3)} Ω/kft)
                </Typography>
                <Typography variant="body2">
                  Inductance L: {rlcResults[idx].L.toExponential(3)} H/km
                </Typography>
                <Typography variant="body2">
                  Capacitance C: {rlcResults[idx].C.toExponential(3)} F/km
                </Typography>
              </Box>
            )
          })}
          {rlcResults[0] && (
          <Box>
            <Typography variant="h6" sx={{ mt: 2 }}>Total Values:</Typography>
            <Typography variant="body1">
              Total Resistance XL<sub>pk</sub>: {totalXlpk.toExponential(3)} Ω/1000m ({(totalXlpk * 0.3048).toExponential(3)} Ω/1000ft)
            </Typography>
            <Typography variant="body1">
              Total Resistance XC<sub>pk</sub>: {totalXcpk.toExponential(3)} Ω/1000m ({(totalXcpk * 0.3048).toExponential(3)} Ω/1000ft)
            </Typography>
          </Box>
          )}
        </Box>
      </Box>
  );
}

export default App;