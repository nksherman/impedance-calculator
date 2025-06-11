import React from 'react';
import { Box, Select, MenuItem, FormControl, InputLabel, Typography, IconButton, Button } from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { conductorProperties, conductorData } from '../data/conductorData';

const phaseLabel  = ['A', 'B', 'C', 'D'];

function ConductorInput({
  conductorIndices, setConductorIndices,
  propertyIndices, setPropertyIndices
}) {

  // Add a new conductor row (max 3)
  const handleAddConductor = () => {
    if (conductorIndices.length < 3) {
      setConductorIndices([...conductorIndices, 0]);
      setPropertyIndices([...propertyIndices, 0]);
    }
  };
  // Remove a conductor row (min 1)
  const handleRemoveConductor = (idx) => {
    if (conductorIndices.length > 1) {
      const newConds = conductorIndices.filter((_, i) => i !== idx);
      const newProps = propertyIndices.filter((_, i) => i !== idx);
      setConductorIndices(newConds);
      setPropertyIndices(newProps);
    }
  };


  const handleConductorChange = (idx, value) => {
    const newIndices = [...conductorIndices];
    newIndices[idx] = value;
    setConductorIndices(newIndices);
  };


  const handlePropertyChange = (idx, value) => {
    const newProps = [...propertyIndices];
    newProps[idx] = value;
    setPropertyIndices(newProps);
  };

  return (
    <Box>
      {conductorIndices.map((conIdx, idx) => {
        const conductor = conductorData[conductorIndices[idx]];
        const property = conductorProperties[propertyIndices[idx]];
        // Generate unique IDs for accessibility
        const conductorSelectId = `conductor-select-${idx}`;
        const conductorLabelId = `conductor-label-${idx}`;
        const materialSelectId = `material-select-${idx}`;
        const materialLabelId = `material-label-${idx}`;
        return (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton
              aria-label="remove"
              color="error"
              onClick={() => handleRemoveConductor(idx)}
              disabled={conductorIndices.length === 1}
              sx={{ mr: 1 }}
              size="large"
            >
              <RemoveCircleOutlineIcon />
            </IconButton>
            <FormControl sx={{ mr: 2, minWidth: 180 }}>
              <InputLabel id={conductorLabelId}>{`Conductor ${phaseLabel[idx]}`}</InputLabel>
              <Select
                labelId={conductorLabelId}
                id={conductorSelectId}
                value={conductorIndices[idx]}
                label={`Conductor ${idx + 1}`}
                onChange={e => handleConductorChange(idx, e.target.value)}
              >
                {conductorData.map((opt, i) => (
                  <MenuItem key={opt.name} value={i}>{opt.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ mr: 2, minWidth: 180 }}>
              <InputLabel id={materialLabelId}>{`Material ${phaseLabel[idx]}`}</InputLabel>
              <Select
                labelId={materialLabelId}
                id={materialSelectId}
                value={propertyIndices[idx]}
                label={`Material ${idx + 1}`}
                onChange={e => handlePropertyChange(idx, e.target.value)}
              >
                {conductorProperties.map((opt, i) => (
                  <MenuItem key={opt.type} value={i}>{opt.type}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mr: 2 }}>
              <Typography variant="body2">Strands: {conductor.strand_count}</Typography>
              <Typography variant="body2">Strand Dia: {conductor.strand_dia} mm</Typography>
              <Typography variant="body2">Outer Dia: {conductor.outer_diam} mm</Typography>
            </Box>
            <Box sx={{ ml: 2 }}>
              <Typography variant="body2">Resistivity: {property.resistivity} Ω·m</Typography>
              <Typography variant="body2">Temp Coef: {property.temp_coef_of_resistivity} 1/C</Typography>
              <Typography variant="body2">Permeability(Rel): {property.permeability_relative}</Typography>
              <Typography variant="body2">Conductivity: {property.conductor_conductivity} S/m</Typography>
            </Box>
          </Box>
        );
      })}
      <Button
        variant="outlined"
        startIcon={<AddCircleOutlineIcon />}
        onClick={handleAddConductor}
        disabled={conductorIndices.length >= 3}
        sx={{ mt: 1 }}
      >
        Add Conductor
      </Button>
    </Box>
  );
}


export default ConductorInput;