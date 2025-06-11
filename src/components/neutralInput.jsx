import React, { useState, useEffect } from 'react';
import { Box, Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';
import { conductorProperties, conductorData } from '../data/conductorData';

function NeutralInput({ 
  neutralIndex, setNeutralIndex, 
  neutralProperty, setNeutralProperty 
}) {

  const [neutralType, setNeutralType] = useState('Span'); // or MGN

  useEffect(() => {
    if (neutralType === 'MGN') {
      setNeutralIndex(null);
    } else if (neutralType === 'Span' && neutralIndex === null) {
      setNeutralIndex(0);
    }
  }, [neutralType, setNeutralIndex, neutralIndex]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Neutral Conductor Input
      </Typography>
      <FormControl sx={{ mr: 2, minWidth: 180 }}>
        <InputLabel id="neutral-type-label">Neutral Type</InputLabel>
        <Select
          labelId="neutral-type-label"
          id="neutral-type-select"
          value={neutralType}
          label="Neutral Type"
          onChange={e => setNeutralType(e.target.value)}
        >
          <MenuItem value="Span">Span</MenuItem>
          <MenuItem value="MGN">MGN</MenuItem>
        </Select>
      </FormControl>
      {neutralType === "Span" && (
        <>
          <FormControl sx={{ mr: 2, minWidth: 180 }}>
            <InputLabel shrink id="neutral-conductor-label">Neutral Conductor</InputLabel>
            <Select
              labelId="neutral-conductor-label"
              id="neutral-conductor-select"
              value={neutralIndex}
              onChange={e => setNeutralIndex(e.target.value)}
              label="Neutral Conductor"
            >
              {conductorData.map((cond, idx) => (
                <MenuItem key={idx} value={idx}>
                  {cond.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ mr: 2, minWidth: 180 }}>
            <InputLabel id="neutral-material-label">Neutral Material</InputLabel>
            <Select
              labelId="neutral-material-label"
              id="neutral-material-select"
              value={neutralProperty}
              onChange={e => setNeutralProperty(e.target.value)}
              label="Neutral Material"
            >
              {conductorProperties.map((prop, idx) => (
                <MenuItem key={prop.type} value={idx}>
                  {prop.type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              Strands: {conductorData[neutralIndex]?.strand_count}
            </Typography>
            <Typography variant="body2">
              Strand Dia: {conductorData[neutralIndex]?.strand_dia} mm
            </Typography>
            <Typography variant="body2">
              Outer Dia: {conductorData[neutralIndex]?.outer_diam} mm
            </Typography>
            <Typography variant="body2">
              Resistivity: {conductorProperties[neutralProperty]?.resistivity} Ω·m
            </Typography>
            <Typography variant="body2">
              Temp Coef: {conductorProperties[neutralProperty]?.temp_coef_of_resistivity} 1/C
            </Typography>
            <Typography variant="body2">
              Permeability(Rel): {conductorProperties[neutralProperty]?.permeability_relative} H/m
            </Typography>
            <Typography variant="body2">
              Conductivity: {conductorProperties[neutralProperty]?.conductor_conductivity} S/m
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}

export default NeutralInput;