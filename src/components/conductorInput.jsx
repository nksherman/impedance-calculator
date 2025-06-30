import React, { useState, useEffect} from 'react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { createConductor } from './conductorHelpers';

import ConductorRow from './conductorRow.jsx';

const phaseLabel  = ['A', 'B', 'C', 'D'];

function ConductorInput({ 
  conductorArrangements,
  setConductorArrangements, 
  handlePopoverOpen,
  conductorData,
  conductorProperties
}) {

  const [conductorIndices, setConductorIndices] = useState(() => 
    conductorArrangements.map(() => 0)
  );
  const [propertyIndices, setPropertyIndices] = useState(() => 
    conductorArrangements.map(() => 0)
  );

  const [corePropertyIndices, setCorePropertyIndices] = useState(() =>
    conductorArrangements.map(() => 0)
  );

  // const [insulatorIndices, setInsulatorIndices] = useState(() => 
  //   conductorArrangements.map(() => 0)
  // );
  // const [insulatorThicknesses, setInsulatorThicknesses] = useState(() => 
  //   conductorArrangements.map(() => '')
  // );

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
    setCorePropertyIndices(prev => {
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
    const currentConductor = conductorArrangements[idx];

    const selectedConductorData = conductorData[value];
    // current other settings
    const currentProperties = conductorProperties[propertyIndices[idx]];
    const coreProperties = conductorProperties[corePropertyIndices[idx]];

    const newConductor = createConductor(selectedConductorData, currentProperties, coreProperties);
    
    const updatedArrangements = [...conductorArrangements];
    updatedArrangements[idx] = newConductor;
    setConductorArrangements(updatedArrangements);
    
    const newIndices = [...conductorIndices];
    newIndices[idx] = value;
    setConductorIndices(newIndices);
  };

  const handlePropertyChange = (idx, value) => {
    const currentConductor = conductorArrangements[idx];

    const selectedProperties = conductorProperties[value];
    // current other settings
    const currentConductorData = conductorData[conductorIndices[idx]];
    const coreProperties = conductorProperties[corePropertyIndices[idx]];
    
    if (currentConductorData) {
      const newConductor = createConductor(currentConductorData, selectedProperties, coreProperties);
      
      const updatedArrangements = [...conductorArrangements];
      updatedArrangements[idx] = newConductor;
      setConductorArrangements(updatedArrangements);
    
      const newProps = [...propertyIndices];
      newProps[idx] = value;
      setPropertyIndices(newProps);
    };
  } 

  const handleCorePropertyChange = (idx, value) => {
    const currentConductor = conductorArrangements[idx];

    const selectedCoreProperties = conductorProperties[value];
    // current other settings
    const currentConductorData = conductorData[conductorIndices[idx]];
    const currentProperties = conductorProperties[propertyIndices[idx]];

    if (currentConductorData) {
      const newConductor = createConductor(currentConductorData, currentProperties, selectedCoreProperties);
      const updatedArrangements = [...conductorArrangements];
      updatedArrangements[idx] = newConductor;
      setConductorArrangements(updatedArrangements);
    }

    const newCoreProps = [...corePropertyIndices];
    newCoreProps[idx] = value;
    setCorePropertyIndices(newCoreProps);
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
            <ConductorRow
              key={idx}
              conductor={conductor}
              rowName={phaseLabel[idx]}
              handleConductorChange={(e_val) => handleConductorChange(idx, e_val)}
              handlePropertyChange={(e_val) => handlePropertyChange(idx, e_val)}
              handleCorePropertyChange={(e_val) => handleCorePropertyChange(idx, e_val)}
              handlePopoverOpen={handlePopoverOpen}
              conductorDataArray={conductorData}
              conductorPropertiesArray={conductorProperties}
            />
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