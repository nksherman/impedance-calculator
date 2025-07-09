import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, InputAdornment } from '@mui/material';

import IconButton from '@mui/material/IconButton';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';


import Inductance from './math/inductance.jsx';
import Resistance from './math/resistance.jsx';
import ResistanceLoop from './math/resistanceLoop.jsx';
import Capacitance from './math/capacitance.jsx';
import ReactanceInductance from './math/reactanceInductance.jsx';
import ReactanceCapacitance from './math/reactanceCapacitance.jsx';

// rlcResults = [{R, L, C},...]  Ohm/{unit} for each conductor arrangement

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((v, i) =>
    v.R === b[i].R && v.L === b[i].L && v.C === b[i].C
  );
}

function calcPhaseValues({ R, L, C }, freq) {
  const omega = 2 * Math.PI * freq;
  const Xl = L ? omega * L : 0;
  const Xc = 0
  // const Xc = C ? (1 / (omega * C)) : 0;
  const X = Xl; // ( - Xc)
  const Z = Math.sqrt(R * R + X * X);
  const phaseAngle = Math.atan2(X, R);
  const PF = Math.cos(phaseAngle);
  return { R, L, Xl, C, Xc, X, Z, phaseAngle, PF };
}

function ResultsDisplay({ rlcResults, conductors, frequency, vll, vln, unit, handlePopoverOpen }) {
  const [kva, setKva] = useState('');
  const [length, setLength] = useState('');
  const [voltageDrop, setVoltageDrop] = useState(null);

  const lengthLabel = unit === 'mm' ? 'km' : 'kft';
  const factor = unit === 'mm' ? 1000 : 304.8; // per meter to per km/kft

  // Calculate per-phase values
  const phaseValues = rlcResults.map(res => calcPhaseValues(res, frequency));

  // Check if all phases are the same
  const allSame = arraysEqual(rlcResults, Array(rlcResults.length).fill(rlcResults[0]));

  // K-Factor calculation
  const getKFactor = (Z, vbase, phaseCount, PF) => {
    const kFactorMult = phaseCount === 3 ? Math.sqrt(3) : 1;
    return Z / (kFactorMult * vbase * PF);
  };

  // Voltage drop calculation
  const handleVoltageDrop = () => {
    if (!kva || !length) return setVoltageDrop(null);
    // Use the first phase for calculation if all are the same, else average Z and PF
    let Z, PF;
    if (allSame) {
      Z = phaseValues[0].Z * factor;
      PF = phaseValues[0].PF;
    } else {
      Z = phaseValues.reduce((sum, v) => sum + v.Z * factor, 0) / phaseValues.length;
      PF = phaseValues.reduce((sum, v) => sum + v.PF, 0) / phaseValues.length;
    }
    const phaseCount = rlcResults.length === 3 ? 3 : 1;
    const vbase = phaseCount === 3 ? vll : vln;
    // I = (kVA * 1000) / (phaseMult * vbase)
    const phaseMult = phaseCount === 3 ? Math.sqrt(3) : 1;
    const I = (parseFloat(kva) * 1000) / (phaseMult * vbase);
    // Vdrop = I * Z * length
    const Vdrop = I * Z * parseFloat(length);
    setVoltageDrop(Vdrop);
  };

  const conductorPropertyLabel = (conductor) => {
    // get the weighted properties, and return a label for it
    if (!conductor) return conductor.name || "No Name";

    const properties = conductor.weightedProperties;
    if (!properties || properties.length === 0) return conductor.name;

    return (
      <>
        <Typography>{conductor.name}</Typography>
        {properties.length > 1 ? properties.map((p, idx) => (
          <Typography variant="caption" key={idx} display="block">
            {p.weight_percent.toFixed(2)}% {p.type}
          </Typography>
        )) : (
          <Typography variant="caption" display="block">
            {properties[0].type}
          </Typography>
        )}
      </>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Results</Typography>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Phase</TableCell>
              <TableCell>
                <Typography variant="body2">Size</Typography>
                <Typography variant="body2">Material</Typography>
              </TableCell>
              <TableCell align="right">
                R (Ω/{lengthLabel})
                <IconButton
                  size="small"
                  aria-label="info"
                  color="primary"
                  onClick={(e) => handlePopoverOpen(e, <ResistanceLoop />)}
                >
                  <InfoOutlinedIcon fontSize="inherit" />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="info"
                  color="primary"
                  onClick={(e) => handlePopoverOpen(e, <Resistance />)}
                >
                  <InfoOutlinedIcon fontSize="inherit" />
                </IconButton>
              </TableCell>
              <TableCell align="right">
                L (H/{lengthLabel})
                <IconButton
                  size="small"
                  aria-label="info"
                  color="primary"
                  onClick={(e) => handlePopoverOpen(e, <Inductance />)}
                >
                  <InfoOutlinedIcon fontSize="inherit" />
                </IconButton>
              </TableCell>
              <TableCell align="right">
                X<sub>L</sub> (Ω/{lengthLabel})
                <IconButton
                  size="small"
                  aria-label="info"
                  color="primary"
                  onClick={(e) => handlePopoverOpen(e, <ReactanceInductance />)}
                >
                  <InfoOutlinedIcon fontSize="inherit" />
                </IconButton>
              </TableCell>
              <TableCell align="right">
                C (F/{lengthLabel})
                <IconButton
                  size="small"
                  aria-label="info"
                  color="primary"
                  onClick={(e) => handlePopoverOpen(e, <Capacitance />)}
                >
                  <InfoOutlinedIcon fontSize="inherit" />
                </IconButton>
              </TableCell>
              <TableCell align="right">X
                <sub>C</sub> (Ω/{lengthLabel})
                <IconButton
                  size="small"
                  aria-label="info"
                  color="primary"
                  onClick={(e) => handlePopoverOpen(e, <ReactanceCapacitance />)}
                >
                  <InfoOutlinedIcon fontSize="inherit" />
                </IconButton>
              </TableCell>
              <TableCell align="right">
                |Z| (Ω/{lengthLabel})
              </TableCell>
              <TableCell align="right">
                <Box>
                  <Typography variant="body2">K-Factor</Typography>
                  <Typography variant="caption" color="text.secondary">×1000</Typography>
                </Box>
              </TableCell>
              <TableCell align="right">PF</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(allSame ? [phaseValues[0]] : phaseValues).map((val, idx) => {
              const thisCond = conductors[idx];
              const phaseCount = rlcResults.length === 3 ? 3 : 1;
              const vbase = phaseCount === 3 ? vll : vln;
              const kFactor = getKFactor(val.Z * factor, vbase, phaseCount, val.PF);
              return (
                <TableRow key={idx}>
                  <TableCell>{allSame ? 'All' : String.fromCharCode(65 + idx)}</TableCell>
                  <TableCell>
                    {conductorPropertyLabel(thisCond)}
                  </TableCell>
                  <TableCell align="right">{(val.R * factor).toFixed(4)}</TableCell>
                  <TableCell align="right">{val.L.toExponential(4)}</TableCell>
                  <TableCell align="right">{(val.Xl * factor).toFixed(4)}</TableCell>
                  <TableCell align="right">{val.C.toExponential(4)}</TableCell>
                  <TableCell align="right">- - -</TableCell> {/* {(val.Xc * factor).toFixed(3)} */}
                  <TableCell align="right">{(val.Z * factor).toFixed(4)}</TableCell>
                  <TableCell align="right">{(kFactor * 1000).toFixed(5)}</TableCell>
                  <TableCell align="right">{val.PF.toFixed(4)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Load (kVA)"
          value={kva}
          onChange={e => setKva(e.target.value)}
          type="number"
          size="small"
          InputProps={{
            endAdornment: <InputAdornment position="end">kVA</InputAdornment>,
            inputProps: { min: 0 }
          }}
        />
        <TextField
          label={`Length (${lengthLabel})`}
          value={length}
          onChange={e => setLength(e.target.value)}
          type="number"
          size="small"
          InputProps={{
            endAdornment: <InputAdornment position="end">{lengthLabel}</InputAdornment>,
            inputProps: { min: 0 }
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="button"
            sx={{ cursor: 'pointer', ml: 1, color: 'primary.main' }}
            onClick={handleVoltageDrop}
          >
            Calc Voltage Drop
          </Typography>
        </Box>
      </Box>
      {voltageDrop !== null && (
        <Typography variant="subtitle1" color="secondary">
          Voltage Drop: {voltageDrop.toFixed(2)} V
        </Typography>
      )}
    </Box>
  );
}

export default ResultsDisplay;