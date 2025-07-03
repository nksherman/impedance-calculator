import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';

import { createConductor } from './conductorHelpers';
import ConductorRow from './conductorRow.jsx';

function NeutralInput({ 
  neutralArrangement, 
  setNeutralArrangement,
  handlePopoverOpen,
  conductorData,
  conductorProperties,
}) {
  const [neutralType, setNeutralType] = useState('MGN'); // or MGN

  useEffect(() => {
    if (neutralType === 'MGN') {
      setNeutralArrangement("");
    } else if (neutralType === 'Span' && !neutralArrangement) {
      // Set to default conductor if switching from blank
      const defaultConductor = createConductor(conductorData[0], conductorProperties[0]);
      setNeutralArrangement(defaultConductor);
    }
  }, [neutralType, setNeutralArrangement, neutralArrangement, conductorData, conductorProperties]);

  // These handlers match the signature expected by ConductorRow
  const handleConductorChange = (value) => {
    const selectedConductorData = conductorData[value];
    const currentProperties = neutralArrangement && neutralArrangement.conductorProperties
      ? neutralArrangement.conductorProperties
      : conductorProperties[0];
    const coreProperties = neutralArrangement && neutralArrangement.coreProperties
      ? neutralArrangement.coreProperties
      : undefined;
    setNeutralArrangement(createConductor(selectedConductorData, currentProperties, coreProperties));
  };

  const handlePropertyChange = (value) => {
    const selectedProperties = conductorProperties[value];
    const currentConductorData = neutralArrangement && neutralArrangement.name
      ? conductorData.find(c => c.name === neutralArrangement.name)
      : conductorData[0];
    const coreProperties = neutralArrangement && neutralArrangement.coreProperties
      ? neutralArrangement.coreProperties
      : undefined;
    setNeutralArrangement(createConductor(currentConductorData, selectedProperties, coreProperties));
  };

  const handleCorePropertyChange = (value) => {
    const selectedCoreProperties = conductorProperties[value];
    const currentConductorData = neutralArrangement && neutralArrangement.name
      ? conductorData.find(c => c.name === neutralArrangement.name)
      : conductorData[0];
    const currentProperties = neutralArrangement && neutralArrangement.conductorProperties
      ? neutralArrangement.conductorProperties
      : conductorProperties[0];
    setNeutralArrangement(createConductor(currentConductorData, currentProperties, selectedCoreProperties));
  };

  return (
    <Box sx={{ p: 1, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center" }} >
          <Typography variant="h6" gutterBottom>
            Neutral
          </Typography>
          <FormControl sx={{ minWidth: 120 }}>
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
      {/* Row 2: ConductorRow (only if Span) */}
      {neutralType === "Span" && neutralArrangement && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mindWidth: 500 }}>
          <ConductorRow
            conductor={neutralArrangement}
            rowName={"Neutral"}
            handleConductorChange={handleConductorChange}
            handlePropertyChange={handlePropertyChange}
            handleCorePropertyChange={handleCorePropertyChange}
            handlePopoverOpen={handlePopoverOpen}
            conductorDataArray={conductorData}
            conductorPropertiesArray={conductorProperties}
          />
        </Box>
      )}
    </Box>
  );
}

export default NeutralInput;