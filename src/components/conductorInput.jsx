import React from 'react';
import { Box, Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';



function ConductorInput({
  conductorData, conductorProperties, 
  conductorIndices, setConductorIndices,
  propertyIndices, setPropertyIndices
}) {

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
      {[0, 1, 2].map((idx) => {
        const conductor = conductorData[conductorIndices[idx]];
        const property = conductorProperties[propertyIndices[idx]];
        return (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FormControl sx={{ mr: 2, minWidth: 180 }}>
              <InputLabel>{`Conductor ${idx + 1}`}</InputLabel>
              <Select
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
              <InputLabel>{`Material ${idx + 1}`}</InputLabel>
              <Select
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
              <Typography variant="body2"><b>{property.type}</b></Typography>
              <Typography variant="body2">Resistivity: {property.resistivity} Ω·m</Typography>
              <Typography variant="body2">Temp Coef: {property.temp_coef_of_resistivity} 1/C</Typography>
              <Typography variant="body2">Permeability: {property.conductor_permeability} H/m</Typography>
              <Typography variant="body2">Permissivity: {property.conductor_permissivity} F/m</Typography>
              <Typography variant="body2">Conductivity: {property.conductor_conductivity} S/m</Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  )
}

export default ConductorInput;