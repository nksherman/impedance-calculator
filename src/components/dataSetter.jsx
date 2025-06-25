import React, { useRef } from 'react';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Cannot import ts interfaces for reasons
const ConductorDataModel = {
  name: 'string',
  strand_count: 'number',
  strand_dia: 'number',
  outer_dia: 'number',
};

const ConductorPropertiesModel = {
  type: 'string',
  temp_reference: 'number',
  resistivity: 'number',
  temp_coef_of_resistivity: 'number',
  permeability_relative: 'number',
  conductivity: 'number',
};

function validateConductorData(data) {
  if (!Array.isArray(data)) return 'Data is not an array';
  for (let i = 0; i < data.length; i++) {
    for (const key of Object.keys(ConductorDataModel)) {
      if (!(key in data[i])) {
        return `Missing field "${key}" in conductorData at index ${i}`;
      }
    }
  }
  return null; // valid
}

function validateConductorProperties(data) {
  if (!Array.isArray(data)) return 'Data is not an array';
  for (let i = 0; i < data.length; i++) {
    for (const key of Object.keys(ConductorPropertiesModel)) {
      if (!(key in data[i])) {
        return `Missing field "${key}" in conductorProperties at index ${i}`;
      }
    }
  }
  return null; // valid
}

function DataSetter({ 
  conductorData, setConductorData,
  conductorProperties, setConductorProperties,
}) {
  const fileInputRef = useRef();

  const handleDownload = () => {
    const blob = new Blob(
      [JSON.stringify({ conductorData, conductorProperties }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conductor_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const json = JSON.parse(evt.target.result);
        const dataError = validateConductorData(json.conductorData);
        const propError = validateConductorProperties(json.conductorProperties);
        if (!dataError && !propError) {
          setConductorData(json.conductorData);
          setConductorProperties(json.conductorProperties);
        } else {
          console.log('Invalid uploaded data:', json);
          if (dataError) console.log('ConductorData error:', dataError);
          if (propError) console.log('ConductorProperties error:', propError);
          alert(dataError || propError || 'Invalid file format or missing required fields.');
        }
      } catch {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Typography variant="h6" gutterBottom>
          Import/Export Conductor Data
        </Typography>
        <IconButton
          color="primary"
          aria-label="info"
        >
          <Tooltip title="Edit json with notepad or similar editor">
            <InfoOutlinedIcon />
          </Tooltip>
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
        >
          Download Data
        </Button>
        <input
          type="file"
          accept="application/json"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleUpload}
        />
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          Upload Data
        </Button>
      </Box>
    </Paper>
  );
}

export default DataSetter;