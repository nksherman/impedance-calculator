import React, { useState, useEffect } from 'react';
import { Button, ButtonGroup, ToggleButton,  Box, Typography, InputAdornment, FormControl, FormHelperText, InputLabel, FilledInput } from '@mui/material';

import { getRadiusValue } from '../data/conductorData';


const phaseLabel  = ['A', 'B', 'C', 'D'];

function DistanceMatrix({ gmd, setGmd, conductorIndices, unit, neutralIndex = "" }) {
  // Compute matrix size
  const hasNeutral = neutralIndex !== "";
  const N = conductorIndices.length + (hasNeutral ? 1 : 0);


  const [distances, setDistances] = useState(
    Array.from({ length: N }, () => Array(N).fill(0))
  );


  useEffect(() => {
    const newN = conductorIndices.length + (neutralIndex !== "" ? 1 : 0);
    setDistances(prev => {
      // Expand or shrink the matrix as needed
      let newDistances = prev.slice(0, newN).map(row => row.slice(0, newN));
      while (newDistances.length < newN) {
        newDistances.push(Array(newN).fill(0));
      }
      newDistances = newDistances.map(row => {
        while (row.length < newN) row.push(0);
        return row;
      });
      return newDistances;
    });
  }, [conductorIndices.length, neutralIndex]);

  // Conversion factors
  const mmToIn = (mm) => mm / 25.4;
  const inToMm = (inch) => inch * 25.4;

  const handleDistanceChange = (i, j, value) => {
    setDistances(prev => {
      const newDistances = prev.map(row => [...row]);
      newDistances[i][j] = value;
      if (i !== j) newDistances[j][i] = value;
      return newDistances;
    });
  };

  const handleInput = (e, i, j) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      handleDistanceChange(i, j, value);
    }
  };
  
  const getRadius = (idx) => {

    if (idx < conductorIndices.length) {
      return getRadiusValue(conductorIndices[idx]);
    } else if (hasNeutral && idx === conductorIndices.length) {
      return getRadiusValue(neutralIndex);
    }
    return 0;
  };

  const calculateSelfDistance = (idx) => {
    const r = getRadius(idx); // mm
    const gmr_mm = r * Math.exp(-0.25);
    return unit === 'mm' ? gmr_mm.toFixed(4) : mmToIn(gmr_mm).toFixed(4);
  };

  const calculateGMD = () => {
    let product = 1;
    let count = 0;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (i === j) continue;
        if (i < j) {
          let d = parseFloat(distances[i][j]);
          if (isNaN(d) || d <= 0) {
            setGmd('Invalid distances');
            return;
          }
          if (unit === 'in') d = inToMm(d);
          product *= d;
          count++;
        }
      }
    }
    // For 3 conductors, geometric mean is (D12 * D13 * D23)^(1/3)
    const gmd_mm = Math.pow(product, 1 / count);
    setGmd(gmd_mm);
  };

  return (
    <Box border={1}>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Distances (mm):
      </Typography>
      <Box>
        {Array.from({ length: N }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', mb: 1 }}>
            {Array.from({ length: N }).map((_, j) => {
              if (j < i) {
                return <Box key={j} sx={{ width: 120, mr: 2 }} />;
              }
              // Label for conductors or neutral
              const label =
                i === j
                  ? (i < conductorIndices.length
                      ? `GMR${phaseLabel[i]}`
                      : 'GMRn')
                  : (i < conductorIndices.length
                      ? (j < conductorIndices.length
                          ? `D${phaseLabel[i]}${phaseLabel[j]}`
                          : `Dn${phaseLabel[i]}`)
                      : (j < conductorIndices.length
                          ? `Dn${phaseLabel[i]}`
                          : 'Dnn'));
              return (
                <FormControl key={j} sx={{ mr: 2, width: 120 }}>
                  <InputLabel shrink htmlFor={`distance-${i}${j}`}>
                    {label}
                  </InputLabel>
                  <FilledInput
                    id={`distance-${i}${j}`}
                    value={i === j ? calculateSelfDistance(i) : (distances[i][j] ?? "")}
                    onChange={e => handleInput(e, i, j)}
                    disabled={i === j}
                    endAdornment={<InputAdornment position="end">{unit}</InputAdornment>}
                    inputProps={{
                      'aria-label': 'distance',
                      inputMode: 'decimal',
                      pattern: '[0-9]*[.]?[0-9]*',
                      min: '0',
                      style: { MozAppearance: 'textfield' }
                    }}
                  />
                  <FormHelperText>
                    {i === j ? 'Auto (r·e⁻¹/⁴)' : ''}
                  </FormHelperText>
                </FormControl>
              );
            })}
          </Box>
        ))}
      </Box>

      <Button variant="contained" sx={{ mt: 2 }} onClick={calculateGMD}>Calculate GMD</Button>
      {gmd && !isNaN(gmd) && (
        <Typography variant="h6" sx={{ mt: 2 }}>{`GMD = ${gmd.toFixed(4)} mm (${mmToIn(gmd).toFixed(4)} in)`}</Typography>
      )}
      {gmd === 'Invalid distances' && (
        <Typography color="error" sx={{ mt: 2 }}>Invalid distances</Typography>
      )}
    </Box>
  );
}

export default DistanceMatrix;