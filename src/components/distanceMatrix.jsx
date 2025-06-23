import React, { useState, useEffect } from 'react';
import { Button, ButtonGroup, ToggleButton, FormControlLabel, Switch,  Box, Typography, InputAdornment, FormControl, FormHelperText, InputLabel, FilledInput } from '@mui/material';



const phaseLabel  = ['A', 'B', 'C', 'D'];

function DistanceMatrix({ gmd, setGmd, conductorArrangements, unit, neutralArrangement = "" }) {
  // Compose internal array for all conductors (phases + optional neutral)
  const hasNeutral = neutralArrangement !== "";
  const allArrangements = hasNeutral
    ? [...conductorArrangements, neutralArrangement]
    : conductorArrangements;
  const N = allArrangements.length;

  const [distances, setDistances] = useState(
    Array.from({ length: N }, () => Array(N).fill(0))
  );

  const [manualOverride, setManualOverride] = useState(false);
  const [manualGmd, setManualGmd] = useState("");

  useEffect(() => {
    const newN = allArrangements.length;
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
  }, [conductorArrangements.length, neutralArrangement]);

  // Conversion factors
  const mmToIn = (mm) => mm / 25.4;
  const inToMm = (inch) => inch * 25.4;

  const displayedUnit = unit === 'in' ? 'in' : 'mm';

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

  const calculateSelfDistance = (idx) => {
    const cond = allArrangements[idx];
    const gmr_mm = cond.gmr() * 1000; // Convert from meters to mm
    return unit === 'mm' ? gmr_mm.toFixed(4) : mmToIn(gmr_mm).toFixed(4);
  };

  const calculateGMD = () => {
    let product = 1;
    let count = 0;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (i === j) {
          let d = calculateSelfDistance(i);
          if (unit === 'in') d = mmToIn(d);
          distances[i][j] = d;
        }
        if (i <= j) {
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

  const handleManualGmdChange = (e) => {
    const val = e.target.value;
    setManualGmd(val);
    if (val === "" || isNaN(val) || Number(val) <= 0) {
      setGmd('Invalid distances');
    } else {
      // Always convert to mm for calculation
      const gmdValue = unit === 'in' ? inToMm(Number(val)) : Number(val);
      setGmd(gmdValue);
    }
  };

  return (
    <Box border={1}>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Distances ({displayedUnit}):
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={manualOverride}
            onChange={e => {
              setManualOverride(e.target.checked);
              if (!e.target.checked) setManualGmd("");
            }}
            color="primary"
          />
        }
        label="Manual GMD override"
        sx={{ mb: 2 }}
      />
      <Box>
        {Array.from({ length: N }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', mb: 1 }}>
            {Array.from({ length: N }).map((_, j) => {
              if (j < i) {
                return <Box key={j} sx={{ width: 120, mr: 2 }} />;
              }
              const label =
                i === j
                  ? (i < conductorArrangements.length
                      ? `GMR${phaseLabel[i]}`
                      : 'GMRn')
                  : (i < conductorArrangements.length
                      ? (j < conductorArrangements.length
                          ? `D${phaseLabel[i]}${phaseLabel[j]}`
                          : `Dn${phaseLabel[i]}`)
                      : (j < conductorArrangements.length
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
                    disabled={i === j || manualOverride}
                    endAdornment={
                      <InputAdornment position="end">{displayedUnit}</InputAdornment>
                    }
                    inputProps={{
                      'aria-label': 'distance',
                      inputMode: 'decimal',
                      pattern: '[0-9]*[.]?[0-9]*',
                      min: '0',
                      style: { MozAppearance: 'textfield' }
                    }}
                  />
                </FormControl>
              );
            })}
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <Button
          variant="contained"
          onClick={calculateGMD}
          disabled={manualOverride}
        >
          Calculate GMD
        </Button>
        <Box sx={{ ml: 2, minWidth: 220 }}>
          {manualOverride && (
            <FormControl fullWidth>
              <InputLabel htmlFor="manual-gmd">Manual GMD</InputLabel>
              <FilledInput
                id="manual-gmd"
                value={manualGmd}
                onChange={handleManualGmdChange}
                endAdornment={
                  <InputAdornment position="end">{displayedUnit}</InputAdornment>
                }
                inputProps={{
                  'aria-label': 'manual-gmd',
                  inputMode: 'decimal',
                  pattern: '[0-9]*[.]?[0-9]*',
                  min: '0',
                  style: { MozAppearance: 'textfield' }
                }}
              />
              <FormHelperText>
                Enter GMD manually ({displayedUnit})
              </FormHelperText>
            </FormControl>
          )}
        </Box>
      </Box>
      {gmd && !isNaN(gmd) && (
        <Typography variant="h6" sx={{ mt: 2 }}>
          {`GMD = ${gmd.toFixed(4)} mm (${mmToIn(gmd).toFixed(4)} in)`}
        </Typography>
      )}
      {gmd === 'Invalid distances' && (
        <Typography color="error" sx={{ mt: 2 }}>Invalid distances</Typography>
      )}
    </Box>
  );
}

export default DistanceMatrix;