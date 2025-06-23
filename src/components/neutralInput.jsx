import React, { useState, useEffect } from 'react';
import { Paper, Box, Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';

import conductorProperties from '../data/conductorProperties.json';
import conductorData from '../data/conductorData.json';
import { createConductor } from './conductorHelpers';

function NeutralInput({ 
  neutralArrangement, setNeutralArrangement
}) {
  const [neutralType, setNeutralType] = useState('MGN'); // or MGN

  // Determine current indices for selects
  const currentConductorIndex = neutralArrangement && neutralArrangement.name
    ? conductorData.findIndex(c => c.name === neutralArrangement.name)
    : 0;
  const currentPropertyIndex = neutralArrangement && neutralArrangement.properties?.type
    ? conductorProperties.findIndex(p => p.type === neutralArrangement.properties.type)
    : 0;

  useEffect(() => {
    if (neutralType === 'MGN') {
      setNeutralArrangement("");
    } else if (neutralType === 'Span' && !neutralArrangement) {
      // Set to default conductor if switching from blank
      const defaultConductor = createConductor(conductorData[0], conductorProperties[0]);
      setNeutralArrangement(defaultConductor);
    }
  }, [neutralType, setNeutralArrangement, neutralArrangement]);

  const handleConductorChange = (idx) => {
    const selectedConductorData = conductorData[idx];
    const currentProperties = neutralArrangement && neutralArrangement.properties
      ? neutralArrangement.properties
      : conductorProperties[0];
    setNeutralArrangement(createConductor(selectedConductorData, currentProperties));
  };

  const handlePropertyChange = (idx) => {
    const selectedProperties = conductorProperties[idx];
    const currentConductorData = neutralArrangement && neutralArrangement.name
      ? conductorData.find(c => c.name === neutralArrangement.name)
      : conductorData[0];
    setNeutralArrangement(createConductor(currentConductorData, selectedProperties));
  };

  return (
    <Box sx={{ p: 2, border: 1, borderRadius: 2, mb: 2 }}>
      {/* Row 1: Neutral Type */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{display: "flex", flexDirection: "row",justifyContent:"center"}} >
        <Typography variant="h6" gutterBottom>
          Neutral
        </Typography>
          <FormControl sx={{ minWidth: 180 }}>
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
        </Box>
      </Box>
      {/* Row 2: Conductor and Material (only if Span) */}
      {neutralType === "Span" && neutralArrangement && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel shrink id="neutral-conductor-label">Neutral Conductor</InputLabel>
            <Select
              labelId="neutral-conductor-label"
              id="neutral-conductor-select"
              value={currentConductorIndex}
              onChange={e => handleConductorChange(e.target.value)}
              label="Neutral Conductor"
              disabled={neutralType !== "Span"}
            >
              <MenuItem value={""} disabled>none</MenuItem>
              {conductorData.map((cond, idx) => (
                <MenuItem key={idx} value={idx}>
                  {cond.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="neutral-material-label">Neutral Material</InputLabel>
            <Select
              labelId="neutral-material-label"
              id="neutral-material-select"
              value={currentPropertyIndex}
              onChange={e => handlePropertyChange(e.target.value)}
              label="Neutral Material"
              disabled={neutralType !== "Span"}
            >
              {conductorProperties.map((prop, idx) => (
                <MenuItem key={prop.type} value={idx}>
                  {prop.type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
    </Box>
  );
}

export default NeutralInput;