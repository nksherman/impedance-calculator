import React, { useState } from 'react';
import { Button, ButtonGroup, ToggleButton,  Box, Typography, InputAdornment, FormControl, FormHelperText, InputLabel, FilledInput } from '@mui/material';

function DistanceMatrix({ gmd, setGmd, getRadiusValue, conductorIndices }) {
  const [distances, setDistances] = useState([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]);
  const [unit, setUnit] = useState('mm'); // 'mm' or 'in'

  // Conversion factors
  const mmToIn = (mm) => mm / 25.4;
  const inToMm = (inch) => inch * 25.4;

  const handleDistanceChange = (i, j, value) => {
    const newDistances = distances.map(row => [...row]);
    newDistances[i][j] = value;
    setDistances(newDistances);
  };

  const handleInput = (e, i, j) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      handleDistanceChange(i, j, value);
    }
  };

  const calculateSelfDistance = (i) => {
    const r = getRadiusValue(i); // mm
    const gmr_mm = r * Math.exp(-0.25);
    return unit === 'mm' ? gmr_mm.toFixed(4) : mmToIn(gmr_mm).toFixed(4);
  };

  const calculateGMD = () => {
    const N = conductorIndices.length;
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
          // Convert to mm if input is in inches
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
    <>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Distances (mm):
      </Typography>
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
        {distances.map((row, i) => (
          <Box key={i} sx={{ display: 'flex', mb: 1 }}>
            {row.map((val, j) => {
              if (j < i) {
                // Lower left: blank
                return <Box key={j} sx={{ width: 120, mr: 2 }} />;
              }
              return (
                <FormControl key={j} sx={{ mr: 2, width: 120 }}>
                  <InputLabel shrink>
                    {i === j ? `GMR${i + 1}` : `D${i + 1}${j + 1}`}
                  </InputLabel>
                  <FilledInput
                    id={`distance-${i}${j}`}
                    value={i === j ? calculateSelfDistance(i) : val}
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
    </>
  );
}

export default DistanceMatrix;