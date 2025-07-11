import React, { useState, useEffect } from 'react';

import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FilledInput from '@mui/material/FilledInput';
import InputAdornment from '@mui/material/InputAdornment';

import './App.css';
import Popover from '@mui/material/Popover';

import NeutralInput from './components/neutralInput.jsx';
import ConductorInput from './components/conductorInput.jsx';
import DistanceMatrix from './components/distanceMatrix.jsx';
import DataSetter from './components/dataSetter.jsx';
import ResultsDisplay from './components/resultsDisplay.jsx';

import { createDefaultConductors } from './components/conductorHelpers.js';
import { calculateRLC as calculateRLCExternal } from './calculators/rlcCalculator.js';

import defaultConductorData from './data/conductorData.json';
import defaultConductorProperties from './data/conductorProperties.json';

function App() {
  const [neutralArrangement, setNeutralArrangement] = useState("");
  const [conductorArrangements, setConductorArrangements] = useState(() => createDefaultConductors(3, defaultConductorData, defaultConductorProperties));

  const [conductorData, setConductorData] = useState(defaultConductorData)
  const [conductorProperties, setConductorProperties] = useState(defaultConductorProperties);


  const [unit, setUnit] = useState('mm'); // 'mm' or 'in'
  const [frequency, setFrequency] = useState(60); // Default frequency in Hz
  const [temperature, setTemperature] = useState(40); // Default temperature in Celsius
  const [vll, setVll] = useState(240); // Line-to-line voltage in volts
  const [vln, setVln] = useState(120);
  const [phaseType, setPhaseType] = useState('3');

  // const [sunIntensity, setSunIntensity] = useState(800); // W/m², typical sunny day
  // const [appliedVoltage, setAppliedVoltage] = useState(120); // V
  // const [convHeatTransfer, setConvHeatTransfer] = useState(25); // W/m²K, typical for air

  const [gmd, setGmd] = useState(0); // mm 
  const [rlcResults, setRlcResults] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverContent, setPopoverContent] = useState(null);

  useEffect(() => {
    if (conductorArrangements.length >= 3 ) {
      setPhaseType('3');
    } else {
      setPhaseType('1');
    }
  }, [conductorArrangements]);

  const calculateRLC = (gmd_mm, frequency) => {
    const { rlcResults, rpk, totalXlpk, totalXcpk, neutralResistance } = calculateRLCExternal(
      frequency,
      temperature,
      gmd_mm,
      conductorArrangements,
      neutralArrangement,
    );
    setRlcResults(rlcResults);
  };

  /* handle popout info and formula */  
  const handlePopoverOpen = (event, content) => {
    setAnchorEl(event.currentTarget);
    setPopoverContent(content);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
    setPopoverContent(null);
  };

  return (
    <Paper className="App" sx={{ p: 4, mx: 2, border: 1 }}>
      <Typography variant="h4" gutterBottom>
        Geometric Mean Distance Calculator
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column-reverse', md: 'row' },
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 4,
        }}
      >
        {/* Left: DistanceMatrix */}
        <Box sx={{ flex: '0 0 40%', minWidth: 320 }}>
          <DistanceMatrix
            gmd={gmd}
            setGmd={setGmd}
            conductorArrangements={conductorArrangements}
            handlePopoverOpen={handlePopoverOpen}
            unit={unit}
            neutralArrangement={neutralArrangement}
          />
        </Box>
        {/* Right: Inputs */}
        <Box sx={{ flex: '0 0 40%', minWidth: 340, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NeutralInput
            neutralArrangement={neutralArrangement}
            setNeutralArrangement={setNeutralArrangement}
            handlePopoverOpen={handlePopoverOpen}
            conductorData={conductorData}
            conductorProperties={conductorProperties}
          />
          <ConductorInput
            conductorArrangements={conductorArrangements}
            setConductorArrangements={setConductorArrangements}
            handlePopoverOpen={handlePopoverOpen}
            conductorData={conductorData}
            conductorProperties={conductorProperties}
          />
        </Box>
      </Box>

      {/* Info Box, and settings */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'flex-start', 
        gap: 4, 
        mt: 2 
      }}>
        <Paper elevation={3} sx={{ p: 2, mt: 2, width: 400, alignSelf: 'flex-start', justifyContent: "left" }}>
          <ButtonGroup sx={{ mb: 2 }}>
            <ToggleButton
              value="mm"
              selected={unit === 'mm'}
              onClick={() => setUnit('mm')}
              size="small"
            >
              mm
            </ToggleButton>
            <ToggleButton
              value="in"
              selected={unit === 'in'}
              onClick={() => setUnit('in')}
              size="small"
            >
              inches
            </ToggleButton>
          </ButtonGroup>
          <Box label="frequency-input">
            {/* Set typography inline with filledInput and justify left */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Frequency (Hz):
              </Typography>
              <FilledInput
                value={frequency}
                onChange={(e) => {
                  const freq = parseFloat(e.target.value);
                  if (isNaN(freq) || freq < 0) {
                    setFrequency('Invalid frequency');
                  } else {
                    setFrequency(freq);
                  }
                }}
                sx={{ mt: 2, mb: 2, width: 200 }}
                size="small"
                inputProps={{
                  'aria-label': 'frequency',
                  type: 'number',
                  min: 0,
                  step: 1,
                }}
              />
            </Box>
            {frequency === 'Invalid frequency' && (
              <Typography color="error" data-testid="freq-error">
                Invalid frequency
              </Typography>
            )}
          </Box>
          <Box label="temperature-input">
            <FilledInput
              value={temperature}
              onChange={e => {
                const temp = parseFloat(e.target.value);
                if (isNaN(temp)) {
                  setTemperature('Invalid temperature');
                } else {
                  setTemperature(temp);
                }
              }}
              endAdornment={<InputAdornment position="end">°C</InputAdornment>}
              sx={{ mt: 2, mb: 2, width: 200 }}
              inputProps={{
                'aria-label': 'temperature',
                type: 'number',
                step: 1,
              }}
            />
            {temperature === 'Invalid temperature' && (
              <Typography color="error" data-testid="temp-error">
                Invalid temperature
              </Typography>
            )}
          </Box>
          <Box label="voltage-input" sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Voltage Inputs:
            </Typography>
            <FilledInput
              value={vll}
              onChange={e => setVll(Number(e.target.value))}
              endAdornment={<InputAdornment position="end">V LL</InputAdornment>}
              sx={{ mb: 2, width: 180 }}
              inputProps={{
                'aria-label': 'voltage-ll',
                type: 'number',
                min: 0,
                step: 1,
              }}
            />
            <FilledInput
              value={vln}
              onChange={e => setVln(Number(e.target.value))}
              endAdornment={<InputAdornment position="end">V LN</InputAdornment>}
              sx={{ mb: 2, width: 180 }}
              inputProps={{
                'aria-label': 'voltage-ln',
                type: 'number',
                min: 0,
                step: 1,
              }}
            />
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              Phase Type: {phaseType === '3' ? 'Three Phase' : phaseType === '1' ? 'Single Phase' : 'Other'}
            </Typography>
          </Box>
        </Paper>
        <Box sx={{ flex: 1, minWidth: 250, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <DataSetter
            conductorData={conductorData}
            setConductorData={setConductorData}
            conductorProperties={conductorProperties}
            setConductorProperties={setConductorProperties} 
          />
          <Button variant="contained" sx={{ mt: 2, width: 220 }} onClick={() => calculateRLC(gmd, frequency)}>Calculate RLC</Button>
        </Box>
      </Box>
      {/*  Results */}
      <Box sx={{ 
        mt: 3, 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 4
      }}>
          <ResultsDisplay
            rlcResults={rlcResults}
            conductors={conductorArrangements}
            frequency={frequency}
            phaseType={phaseType}
            vll={vll}
            vln={vln}
            unit={unit}
            handlePopoverOpen={handlePopoverOpen}
          />
      </Box>
      {/*  Popover anywhere */}
      <Popover
        open={Boolean(anchorEl) && Boolean(popoverContent)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        disableRestoreFocus
      >
        {popoverContent}
      </Popover>
    </Paper>
  );
}

export default App;