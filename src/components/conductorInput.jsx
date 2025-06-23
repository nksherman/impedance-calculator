import React, { useState, useEffect} from 'react';
import { Box, Select, MenuItem, FormControl, InputLabel, Typography, InputAdornment, TextField, IconButton, Button, FilledInput } from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import conductorProperties from '../data/conductorProperties.json';
import conductorData from '../data/conductorData.json';
import insulatorProperties from '../data/insulatorProperties.json';

import { SolidConductor, StrandedConductor } from './conductor/conductorModel.ts';
import { createConductor, getConductorDataByName, getPropertiesByType } from './conductorHelpers';

const phaseLabel  = ['A', 'B', 'C', 'D'];

function ConductorInput({ conductorArrangements, setConductorArrangements, unit }) {

  // Track selected indices for UI display
  const [conductorIndices, setConductorIndices] = useState(() => 
    conductorArrangements.map(() => 0)
  );
  const [propertyIndices, setPropertyIndices] = useState(() => 
    conductorArrangements.map(() => 0)
  );
  // const [insulatorIndices, setInsulatorIndices] = useState(() => 
  //   conductorArrangements.map(() => 0)
  // );
  // const [insulatorThicknesses, setInsulatorThicknesses] = useState(() => 
  //   conductorArrangements.map(() => '')
  // );

  // Update indices arrays when conductorArrangements length changes
  useEffect(() => {
    const newLength = conductorArrangements.length;
    setConductorIndices(prev => {
      const newArr = [...prev];
      while (newArr.length < newLength) newArr.push(0);
      return newArr.slice(0, newLength);
    });
    setPropertyIndices(prev => {
      const newArr = [...prev];
      while (newArr.length < newLength) newArr.push(0);
      return newArr.slice(0, newLength);
    });
    // setInsulatorIndices(prev => {
    //   const newArr = [...prev];
    //   while (newArr.length < newLength) newArr.push(0);
    //   return newArr.slice(0, newLength);
    // });
    // setInsulatorThicknesses(prev => {
    //   const newArr = [...prev];
    //   while (newArr.length < newLength) newArr.push('');
    //   return newArr.slice(0, newLength);
    // });
  }, [conductorArrangements.length]);

  const handleAddConductor = () => {
    const defaultConductorData = conductorData[0];
    const defaultProperties = conductorProperties[0];
    const newConductor = createConductor(defaultConductorData, defaultProperties);
    setConductorArrangements([...conductorArrangements, newConductor]);
  };


  const handleRemoveConductor = (idx) => {
    setConductorArrangements(conductorArrangements.filter((_, i) => i !== idx));
  };

  const handleConductorChange = (idx, value) => {
    const selectedConductorData = conductorData[value];
    const currentConductor = conductorArrangements[idx];
    
    // Create new conductor with same material properties but new conductor data
    const currentProperties = currentConductor.properties || conductorProperties[propertyIndices[idx]];
    const newConductor = createConductor(selectedConductorData, currentProperties);
    
    const updatedArrangements = [...conductorArrangements];
    updatedArrangements[idx] = newConductor;
    setConductorArrangements(updatedArrangements);
    
    // Update UI index
    const newIndices = [...conductorIndices];
    newIndices[idx] = value;
    setConductorIndices(newIndices);
  };

  const handlePropertyChange = (idx, value) => {
    const selectedProperties = conductorProperties[value];
    const currentConductor = conductorArrangements[idx];
    
    // Find the conductor data that matches the current conductor name
    const currentConductorData = conductorData.find(c => c.name === currentConductor.name);
    
    if (currentConductorData) {
      const newConductor = createConductor(currentConductorData, selectedProperties);
      
      const updatedArrangements = [...conductorArrangements];
      updatedArrangements[idx] = newConductor;
      setConductorArrangements(updatedArrangements);
    }
    
    // Update UI index
    const newProps = [...propertyIndices];
    newProps[idx] = value;
    setPropertyIndices(newProps);
  };

  // const handleInsulatorChange = (idx, value) => {
  //   const newIndices = [...insulatorIndices];
  //   newIndices[idx] = value;
  //   setInsulatorIndices(newIndices);

  //   // Reset thickness if set to Bare
  //   if (value === 0) {
  //     const newThicknesses = [...insulatorThicknesses];
  //     newThicknesses[idx] = '';
  //     setInsulatorThicknesses(newThicknesses);
  //   }
  // };

  // const handleThicknessChange = (idx, value) => {
  //   const newThicknesses = [...insulatorThicknesses];
  //   newThicknesses[idx] = value;
  //   setInsulatorThicknesses(newThicknesses);
  // };

  return (
    <Box>
      {conductorArrangements.map((conductor, idx) => {
        // Find current conductor data index for UI display
        const currentConductorIndex = conductorData.findIndex(c => c.name === conductor.name);
        const currentPropertyIndex = conductorProperties.findIndex(p => p.type === conductor.properties?.type);
        // Generate unique IDs for accessibility
        const conductorSelectId = `conductor-select-${idx}`;
        const conductorLabelId = `conductor-label-${idx}`;
        const materialSelectId = `material-select-${idx}`;
        const materialLabelId = `material-label-${idx}`;

        // const insulatorSelectId = `insulator-select-${idx}`;
        // const insulatorLabelId = `insulator-label-${idx}`;
        return (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton
              aria-label="remove"
              color="error"
              onClick={() => handleRemoveConductor(idx)}
              disabled={conductorArrangements.length === 1}
              sx={{ mr: 1 }}
              size="large"
            >
              <RemoveCircleOutlineIcon />
            </IconButton>
            <FormControl sx={{ mr: 2, minWidth: 120 }}>
              <InputLabel id={conductorLabelId}>{`Conductor ${phaseLabel[idx]}`}</InputLabel>
              <Select
                labelId={conductorLabelId}
                id={conductorSelectId}
                value={currentConductorIndex >= 0 ? currentConductorIndex : 0}
                label={`Conductor ${phaseLabel[idx]}`}
                onChange={e => handleConductorChange(idx, e.target.value)}
              >
                {conductorData.map((opt, i) => (
                  <MenuItem key={opt.name} value={i}>{opt.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ mr: 2, minWidth: 120 }}>
              <InputLabel id={materialLabelId}>{`Material ${phaseLabel[idx]}`}</InputLabel>
              <Select
                labelId={materialLabelId}
                id={materialSelectId}
                value={currentPropertyIndex >= 0 ? currentPropertyIndex : 0}
                label={`Material ${phaseLabel[idx]}`}
                onChange={e => handlePropertyChange(idx, e.target.value)}
              >
                <MenuItem value={""} disabled>none</MenuItem>
                {conductorProperties.map((opt, i) => (
                  <MenuItem key={opt.type} value={i}>{opt.type}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* <FormControl sx={{ mr: 2, minWidth: 120 }}>
              <InputLabel id={insulatorLabelId}>{`Insulator ${phaseLabel[idx]}`}</InputLabel>
              <Select
                labelId={insulatorLabelId}
                id={insulatorSelectId}
                value={insulatorIndices[idx]}
                label={`Insulator ${phaseLabel[idx]}`}
                onChange={e => handleInsulatorChange(idx, e.target.value)}
              >
                <MenuItem value={0}>Bare</MenuItem>
                {insulatorProperties.map((opt, i) => (
                  <MenuItem key={opt.type} value={i + 1}>{opt.type}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {insulatorIndices[idx] !== 0 && (
              <FilledInput
                value={
                  // Display in mm or mil (1 mil = 0.0254 mm), but always store in mm
                  unit === 'mm'
                    ? (insulatorThicknesses[idx] || '')
                    : (insulatorThicknesses[idx]
                        ? (parseFloat(insulatorThicknesses[idx]) / 0.0254).toFixed(2)
                        : '')
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (unit === 'mm') {
                    // Store as mm directly
                    handleThicknessChange(idx, val);
                  } else {
                    // User enters mil (thousandths of an inch), store as mm
                    if (val === '') {
                      handleThicknessChange(idx, '');
                    } else {
                      const mil = parseFloat(val);
                      if (!isNaN(mil)) {
                        const mm = mil * 0.0254;
                        handleThicknessChange(idx, mm.toString());
                      }
                    }
                  }
                }}
                endAdornment={
                  <InputAdornment position="end">
                    {unit === 'mm' ? 'mm' : 'mil'}
                  </InputAdornment>
                }
                sx={{ width: 140, mr: 2 }}
                inputProps={{
                  'aria-label': `Insulator Thickness ${phaseLabel[idx]}`,
                  min: 0,
                  step: 0.01
                }}
              />
            )} */}
          </Box>
        );
      })}
      <Button
        variant="outlined"
        startIcon={<AddCircleOutlineIcon />}
        onClick={handleAddConductor}
        disabled={conductorArrangements.length >= 4}
        sx={{ mt: 1 }}
      >
        Add Conductor
      </Button>
    </Box>
  );
}


export default ConductorInput;