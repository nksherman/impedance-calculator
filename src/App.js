import React, { useState } from 'react';
import { Paper,  Box,  ButtonGroup, ToggleButton,  Select, MenuItem, TextField, Button, Typography, InputLabel, FormControl, FilledInput, InputAdornment } from '@mui/material';

import NeutralInput from './components/neutralInput';
import ConductorInput from './components/conductorInput';
import DistanceMatrix from './components/distanceMatrix';

import './App.css';

import conductorProperties from './data/conductorProperties.json';
import conductorData from './data/conductorData.json';

const permeability_of_free_space = 4 * Math.PI * 0.0000001; // H/m
const permissivity_free_space = 8.854*0.000000000001; // F/m

const phase = ['A', 'B', 'C', 'D']; // Phase labels

function formatValue(val, digits = 3) {
  if (val === 0) return "0";
  const absVal = Math.abs(val);
  if (absVal >= 0.01 && absVal < 1000) {
    return val.toFixed(digits);
  }
  return val.toExponential(digits);
}

function App() {
  const [neutralIndex, setNeutralIndex] = useState(""); // Neutral conductor index
  const [neutralProperty, setNeutralProperty] = useState(0); // Neutral conductor property index

  const [conductorIndices, setConductorIndices] = useState([0, 0, 0]);
  const [propertyIndices, setPropertyIndices] = useState([0, 0, 0]);


  const [unit, setUnit] = useState('mm'); // 'mm' or 'in'

  const [frequency, setFrequency] = useState(60); // Default frequency in Hz
  const [totalXlpk, setTotalXlpk] = useState(0); // ohms per km
  const [totalXcpk, setTotalXcpk] = useState(0); // ohms per km

  const [neutralResistance, setNeutralResistance] = useState(0); // ohms per km

  const [gmd, setGmd] = useState(0); // mm 
  const [rlcResults, setRlcResults] = useState([]);


  const calculateRLC = (gmd_mm, frequency) => {

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

    setTotalXlpk(xl_tot * 1000); // Convert to ohms per 1000 m
    setTotalXcpk(cl_tot * 1000);

    // If neutral is selected, calculate its resistance
    if (neutralIndex !== null && neutralIndex !== undefined && conductorData[neutralIndex]) {
      const neutralProp = conductorProperties[neutralProperty];
      const neutralCond = conductorData[neutralIndex];
      const r_m = (neutralCond.outer_diam / 2) / 1000; // mm dia to m rad
      const area = Math.PI * r_m * r_m;
      const neutralR = neutralProp.resistivity / area; // Ω/m
      setNeutralResistance(neutralR * 1000); // Convert to ohms per km
    } else {
      setNeutralResistance(0);
    }
  };

  return (
    <Paper className="App" sx={{ p: 4, border: 1 }}>
      <Typography variant="h4" gutterBottom>
        Geometric Mean Distance Calculator
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 4 }}>
        {/* Left: DistanceMatrix */}
        <Box sx={{ flex: '0 0 40%', minWidth: 320 }}>
          <DistanceMatrix
            gmd={gmd}
            setGmd={setGmd}
            conductorIndices={conductorIndices}
            unit={unit}
            neutralIndex={neutralIndex}
          />
        </Box>
        {/* Right: Inputs */}
        <Box sx={{ flex: '0 0 40%', minWidth: 320, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NeutralInput
            neutralIndex={neutralIndex}
            setNeutralIndex={setNeutralIndex}
            neutralProperty={neutralProperty}
            setNeutralProperty={setNeutralProperty}
          />
          <ConductorInput
            conductorIndices={conductorIndices}
            setConductorIndices={setConductorIndices}
            propertyIndices={propertyIndices}
            setPropertyIndices={setPropertyIndices}
          />
        </Box>
      </Box>


      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 4, mt: 2 }}>
      {/* Info Box, and settings */}
        <Paper elevation={3} sx={{ p: 2, mt: 2, width: 400, alignSelf: 'flex-start', justifyContent: "left" }}>
        <ButtonGroup sx={{ mb: 2 }}>
          <ToggleButton
            value="mm"
            selected={unit === 'mm'}
            onClick={() => setUnit('mm')}
            size="small"
          >
            mm
          </ToggleButton>
          <ToggleButton
            value="in"
            selected={unit === 'in'}
            onClick={() => setUnit('in')}
            size="small"
          >
            inches
          </ToggleButton>
        </ButtonGroup>
        <Box>
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
        </Box>

      </Paper>

      <Button variant="contained" sx={{ mt: 2 }} onClick={() => calculateRLC(gmd, frequency)}>Calculate RLC</Button>

      </Box>

      {/*  Results */}
      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'row', gap: 4 }}>
        {/* Left: Summary values */}
        <Box sx={{ flex: 1, minWidth: 250 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Summary</Typography>
          {/* Max phase resistance pk */}
          <Typography variant="body1">
            Max Phase Resistance R<sub>pk</sub>: {(() => {
              const rFactor = unit === 'mm' ? 1000 : 304.8;
              const maxR = Math.max(...rlcResults.map(res => res?.R ?? 0));
              return `${(maxR * rFactor).toFixed(3)} Ω/${unit === 'mm' ? 'km' : 'kft'}`;
            })()}
          </Typography>
          {/* Loop resistance pk (max phase + neutral) */}

          {neutralIndex !== null && conductorData[neutralIndex] && (
            <Typography variant="body1">
              Loop Resistance R<sub>loop,pk</sub>:{' '}
              {(() => {
                const rFactor = unit === 'mm' ? 1000 : 304.8;
                const maxR = Math.max(...rlcResults.map(res => res?.R ?? 0));
                if (neutralResistance > 0) {
                  // neutralResistance is in ohms per km, convert if needed
                  const neutralR = unit === 'mm' ? neutralResistance : neutralResistance * 0.3048;
                  const loopR = maxR * rFactor + neutralR;
                  return `${loopR.toFixed(3)} Ω/${unit === 'mm' ? 'km' : 'kft'}`;
                }
                return 'N/A';
              })()}
            </Typography>
          )}
          <Typography variant="body1">
            Total Inductive Reactance XL<sub>pk</sub>: {formatValue(unit === 'mm' ? totalXlpk : totalXlpk * 0.3048)} Ω/{unit === 'mm' ? 'km' : 'kft'}
          </Typography>
          <Typography variant="body1">
            Total Capacitive Reactance XC<sub>pk</sub>: {formatValue(unit === 'mm' ? totalXcpk : totalXcpk * 0.3048)} Ω/{unit === 'mm' ? 'km' : 'kft'}
          </Typography>
        </Box>

        {/* Right: Per-phase values */}
        <Box sx={{ flex: 1, minWidth: 250 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Per-phase Values</Typography>
          {conductorIndices.map((conIdx, idx) => {
            if (
              !rlcResults[idx] ||
              conductorIndices[idx] === undefined ||
              propertyIndices[idx] === undefined
            ) {
              return null;
            }

            const lengthLabel = unit === 'mm' ? 'km' : 'kft';
            const rFactor = unit === 'mm' ? 1000 : 304.8;
            const lFactor = unit === 'mm' ? 1 : 0.3048;
            const cFactor = unit === 'mm' ? 1 : 0.3048;

            return (
              <Box key={idx} sx={{ mb: 1, display: 'flex', flexDirection: 'row',  }}>
                <Box>
                  <Typography variant="subtitle1">
                    Phase {phase[idx]} 
                  </Typography>
                  <Typography variant="subtitle2">
                    ({conductorData[conductorIndices[idx]].name}, {conductorProperties[propertyIndices[idx]].type})
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2">
                    Resistance R: {(rlcResults[idx].R * rFactor).toFixed(3)} Ω/{lengthLabel}
                  </Typography>
                  <Typography variant="body2">
                    Inductance L: {formatValue(rlcResults[idx].L * lFactor)} H/{lengthLabel}
                  </Typography>
                  <Typography variant="body2">
                    Capacitance C: {formatValue(rlcResults[idx].C * cFactor)} F/{lengthLabel}
                  </Typography>
                </Box>
              </Box>
            );
          })}
          {neutralIndex !== null && conductorData[neutralIndex] && (
            <Box sx={{ mb: 1, display: 'flex', flexDirection: 'row' }}>
              <Box>
                <Typography variant="subtitle1">
                  Neutral
                </Typography>
                <Typography variant="subtitle2">
                  ({conductorData[neutralIndex].name}, {conductorProperties[neutralProperty].type})
                </Typography>
              </Box>
              <Box>
                {/* Use same factors as above */}
                <Typography variant="body2">
                  Resistance R: {(() => {
                    const neutralR = unit === 'mm' ? neutralResistance : neutralResistance * 0.3048;
                    const lengthLabel = unit === 'mm' ? 'km' : 'kft';
                    return `${neutralR.toFixed(3)} Ω/${lengthLabel}`;
                  })()}
                </Typography>
                {/* L and C for neutral are not typically calculated, but you can add them if needed */}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default App;