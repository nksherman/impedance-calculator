import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, InputAdornment } from '@mui/material';

import ToolTip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FilledInput from '@mui/material/FilledInput';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import Inductance from './math/inductance.jsx';
import Resistance from './math/resistance.jsx';
import ResistanceLoop from './math/resistanceLoop.jsx';
import Capacitance from './math/capacitance.jsx';
import ReactanceInductance from './math/reactanceInductance.jsx';
import ReactanceCapacitance from './math/reactanceCapacitance.jsx';
import KFactor from './math/kFactor.jsx';
import VoltageDrop from './math/voltageDrop.jsx';

function phaseValueEquals(a, b) {
  return a.R === b.R && a.L === b.L && a.C === b.C;
}

function phaseLabels(indices) {
  return indices.map(idx => String.fromCharCode(65 + idx)).join('/');
}

// Group phases with identical values (non-adjacent supported)
function groupPhases(phaseValues, conductors) {
  const groups = [];
  const used = new Array(phaseValues.length).fill(false);

  for (let i = 0; i < phaseValues.length; i++) {
    if (used[i]) continue;
    const indices = [];
    for (let j = 0; j < phaseValues.length; j++) {
      if (!used[j] && phaseValueEquals(phaseValues[i], phaseValues[j])) {
        indices.push(j);
        used[j] = true;
      }
    }
    groups.push({
      label: phaseLabels(indices),
      value: phaseValues[i],
      conductor: conductors ? conductors[indices[0]] : null,
      indices,
    });
  }
  return groups;
}


function ResultsDisplay({ rlcResults, conductors, frequency, phaseType, vll, vln, unit, handlePopoverOpen }) {
  const [kva, setKva] = useState('');
  const [length, setLength] = useState('');
  const [voltageDrops, setVoltageDrops] = useState([]);
  const [overridePF, setOverridePF] = useState(false);
  const [customPF, setCustomPF] = useState(0.95);

  const lengthLabel = unit === 'mm' ? 'km' : 'kft';
  const lengthInputLabel = unit === 'mm' ? 'm' : 'ft';
  const factor = unit === 'mm' ? 1000 : 304.8; // per meter to per km/kft

  // Calculate phase values for all RLC results, applying PF override if needed
  function calculatePhaseValuesWithPF(rlcResults, frequency, overridePF, customPF) {
    return rlcResults.map(({ R, L, C }) => {
      const omega = 2 * Math.PI * frequency;
      let Xl = L ? omega * L : 0;
      let PF, Z, X, Xc, XcReal = 0;
      if (overridePF) {
        PF = Math.max(0.01, Math.min(1, customPF)); // Clamp between 0.01 and 1
        Z = R / PF;
        // Calculate total X needed for this PF, keeping Xl fixed, so Xc = X - Xl
        X = Math.sqrt(Math.max(0, Z * Z - R * R));
        XcReal = C ? 1 / (omega * C) : 0;
        Xc = -(X - Xl);
      } else {
        Xl = L ? omega * L : 0;
        X = Xl;
        Z = Math.sqrt(R * R + X * X);
        PF = R / Z;
        XcReal = C ? 1 / (omega * C) : 0;
        Xc = 0;
      }
      const phaseAngle = Math.atan2(X, R);
      return { R, L, Xl, C, Xc, XcReal, X, Z, phaseAngle, PF };
    });
  }

  const phaseValues = calculatePhaseValuesWithPF(rlcResults, frequency, overridePF, customPF);
  const groupedPhases = groupPhases(phaseValues, conductors);


  // K-Factor calculation
  const getKFactor = (R, X, vbase, phaseType, PF) => {
    const kFactorMult = phaseType === "3" ? Math.sqrt(3) : 2;

    const invPF = Math.sin(Math.acos(PF));
    const nom = R*PF + X*invPF;

    return nom / (kFactorMult * vbase ) * 1000;
  };

  // Voltage drop calculation for each phase
  function handleVoltageDrop() {
    if (!kva || !length || phaseValues.length === 0) return setVoltageDrops([]);
    const lengthInUnits = parseFloat(length) / 1000;
    const vbase = phaseType === "3" ? vll : vln;
    const phaseMult = phaseType === "3" ? Math.sqrt(3) : 2;
    const drops = phaseValues.map(val => {
      const I = (parseFloat(kva)*1000) / (phaseMult * vbase);

      const invPF = Math.sin(Math.acos(val.PF));
      const Z = val.R * val.PF + val.Xl * invPF;
      return I * Z * lengthInUnits * factor;
    });
    setVoltageDrops(drops);

    const dropK = phaseValues.map(val => {
      const K = getKFactor(val.R* factor, val.Xl* factor, vbase, phaseType, val.PF);
      return K * parseFloat(kva) * lengthInUnits;
    });
  }

  const conductorPropertyLabel = (conductor) => {
    // get the weighted properties, and return a label for it
    if (!conductor) return conductor.name || "No Name";
    const properties = conductor.weightedProperties;
    if (!properties || properties.length === 0) return conductor.name;

    return (
      <>
        <Typography sx={{maxWidth:120}}>{conductor.name}</Typography>
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
      <Box sx ={{ display: "flex", flexDirection: 'row', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, pr: 2 }}>
          V<sub>Base</sub> {phaseType === "3" ? `${vll}V(3Ph)` : `${vln}V(1Ph)`}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={overridePF}
                onChange={e => setOverridePF(e.target.checked)}
                color="primary"
              />
            }
            label="Override Power Factor"
            sx={{ mr: 2 }}
          />
          <TextField
            label="Power Factor"
            type="number"
            size="small"
            variant="filled"
            value={customPF}
            onChange={e => setCustomPF(Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)))}
            inputProps={{ min: 0, max: 1, step: 0.01 }}
            disabled={!overridePF}
            sx={{ width: 120 }}
          />
        </Box>
      </Box>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ '& > *': { px: 1 } }}>
              <TableCell>Phase</TableCell>
              <TableCell sx={{ minWidth: '80px'}}>
                <Typography variant="body2">Size</Typography>
                <Typography variant="body2">Material</Typography>
              </TableCell>
              <TableCell align="right" sx={{ minWidth: '100px'}} >
                  R (Ω/{lengthLabel})
                  <IconButton
                    size="small"
                    aria-label="info"
                    color="primary"
                    onClick={(e) => handlePopoverOpen(e, <Resistance />)}
                  >
                    <InfoOutlinedIcon fontSize="inherit" />
                  </IconButton>
              </TableCell>
              <TableCell align="right" sx={{ minWidth: '100px'}}>
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
              <TableCell align="right" sx={{ minWidth: '100px'}} >
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
              <TableCell align="right" sx={{ minWidth: '100px'}} >
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
              <TableCell align="right" sx={{ minWidth: '100px'}} >
                X
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
              <TableCell align="right" sx={{ minWidth: '80px'}} >
                |Z| (Ω/{lengthLabel})
              </TableCell>
              <TableCell align="right" sx={{ minWidth: '100px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Typography variant="body2">K-Factor</Typography>
                    <Typography variant="caption" color="text.secondary">×1000</Typography>
                  </Box>
                  <IconButton
                    size="small"
                    aria-label="info"
                    color="primary"
                    onClick={(e) => handlePopoverOpen(e, <KFactor />)}
                    sx={{ ml: 1 }}
                  >
                    <InfoOutlinedIcon fontSize="inherit" />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell align="right">PF</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groupedPhases.map((group, idx) => {
              const vbase = phaseType === "3" ? vll : vln;
              const kFactor = group.value?.Z ? getKFactor(group.value.R * factor, group.value.Xl * factor, vbase, phaseType, group.value.PF) : 0;
              const condLabel = conductorPropertyLabel(group.conductor);

              return (
                <TableRow key={idx}>
                  <TableCell>{group.label}</TableCell>
                  <TableCell>
                    {condLabel ? condLabel : <Typography>-</Typography>}
                  </TableCell>
                  <TableCell align="right">{group.value?.R ? (group.value.R * factor).toFixed(4) : <Typography>-</Typography>}</TableCell>
                  <TableCell align="right">{group.value?.L ? group.value.L.toExponential(4) : <Typography>-</Typography>}</TableCell>
                  <TableCell align="right">{group.value?.Xl ? (group.value.Xl * factor).toFixed(4) : <Typography>-</Typography>}</TableCell>
                  <TableCell align="right">{group.value?.C ? group.value.C.toExponential(4) : <Typography>-</Typography>}</TableCell>
                  <TableCell align="right">
                    <ToolTip title={`Xc Calc: ${group.value?.XcReal ? (group.value.XcReal * factor).toExponential(2) : 'N/A'}`}>
                      {group.value?.Xc ? (group.value.Xc * factor).toFixed(4) : <Typography>-</Typography>}
                    </ToolTip>
                  </TableCell>
                  <TableCell align="right">{group.value?.Z ? (group.value.Z * factor).toFixed(4) : <Typography>-</Typography>}</TableCell>
                  <TableCell align="right">{kFactor ? (kFactor).toFixed(5) : <Typography>-</Typography>}</TableCell>
                  <TableCell align="right">{group.value?.PF ? group.value.PF.toFixed(4) : <Typography>-</Typography>}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FilledInput
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
          label={`Length (${lengthInputLabel})`}
          value={length}
          onChange={e => setLength(e.target.value)}
          type="number"
          size="small"
          InputProps={{
            endAdornment: <InputAdornment position="end">{lengthInputLabel}</InputAdornment>,
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
      {voltageDrops.length > 0 && (
        <TableContainer component={Paper} sx={{ mb: 2, maxWidth: 400 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Phase</TableCell>
                <TableCell align="right">
                  Voltage Drop (V)
                  <IconButton
                    size="small"
                    aria-label="info"
                    color="primary"
                    onClick={(e) => handlePopoverOpen(e, <VoltageDrop />)}
                  >
                    <InfoOutlinedIcon fontSize="inherit" />
                  </IconButton>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {voltageDrops.map((drop, idx) => (
                <TableRow key={idx}>
                  <TableCell>{String.fromCharCode(65 + idx)}</TableCell>
                  <TableCell align="right">{drop.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default ResultsDisplay;