import React, { useState } from 'react';

import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FilledInput from '@mui/material/FilledInput';
import InputAdornment from '@mui/material/InputAdornment';

import './App.css';
import Popover from '@mui/material/Popover';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import Inductance from './math/inductance.jsx';
import Resistance from './math/resistance.jsx';
import ResistanceLoop from './math/resistanceLoop.jsx';
import Capacitance from './math/capacitance.jsx';
import ReactanceInductance from './math/reactanceInductance.jsx';
import ReactanceCapacitance from './math/reactanceCapacitance.jsx';

import NeutralInput from './components/neutralInput.jsx';
import ConductorInput from './components/conductorInput.jsx';
import DistanceMatrix from './components/distanceMatrix.jsx';
import DataSetter from './components/dataSetter.jsx';

import { createDefaultConductors } from './components/conductorHelpers.js';

import defaultConductorData from './data/conductorData.json';
import defaultConductorProperties from './data/conductorProperties.json';

const permeability_of_free_space = 4 * Math.PI * 0.0000001; // H/m
const permissivity_free_space = 8.854*0.000000000001; // F/m

const phase = ['A', 'B', 'C', 'D']; // Phase labels

function formatValue(val, digits = 3) {
  if (val === 0) return "0";
  const absVal = Math.abs(val);
  if (absVal >= 0.01 && absVal < 1000) {
    return val.toFixed(digits);
  }
  return val.toExponential(digits);
}

function App() {
  const [neutralArrangement, setNeutralArrangement] = useState("");
  const [conductorArrangements, setConductorArrangements] = useState(() => createDefaultConductors(3, defaultConductorData, defaultConductorProperties));

  const [conductorData, setConductorData] = useState(defaultConductorData)
  const [conductorProperties, setConductorProperties] = useState(defaultConductorProperties);


  const [unit, setUnit] = useState('mm'); // 'mm' or 'in'
  const [frequency, setFrequency] = useState(60); // Default frequency in Hz
  const [temperature, setTemperature] = useState(40); // Default temperature in Celsius

  // const [sunIntensity, setSunIntensity] = useState(800); // W/m², typical sunny day
  // const [appliedVoltage, setAppliedVoltage] = useState(120); // V
  // const [convHeatTransfer, setConvHeatTransfer] = useState(25); // W/m²K, typical for air

  const [totalXlpk, setTotalXlpk] = useState(0); // ohms per km
  const [totalXcpk, setTotalXcpk] = useState(0); // ohms per km

  const [neutralResistance, setNeutralResistance] = useState(0); // ohms per km

  const [gmd, setGmd] = useState(0); // mm 
  const [rlcResults, setRlcResults] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverContent, setPopoverContent] = useState(null);

  const calculateRLC = (gmd_mm, frequency) => {
    // early handle frequency = 0 (DC circuit)
    if (frequency === 0) {
      setRlcResults(conductorArrangements.map(conductor => ({
        R: conductor.resistanceFn()(temperature) * 1000, // ohms per  km

        L: 0, // H/m
        C: 0, // F/m

      })));
      setTotalXlpk(0);
      setTotalXcpk(0);
      setNeutralResistance(neutralArrangement ? neutralArrangement.resistanceFn()(temperature) * 1000 : 0);
      return;
    }

    // early handle gmd = 0 (degenerate case)
    if (
      gmd_mm === 0 &&
      conductorArrangements.length === 1 &&
      !neutralArrangement
    ) {
      const conductor = conductorArrangements[0];
      const GMR = conductor.gmr();
      const r_m = conductor.circumscribedRadius();
      const resFn = conductor.resistanceFn();
      const R = resFn(temperature);

      // Use GMR for both GMD and GMR in this degenerate case
      const L = 0
      const C = (2 * Math.PI * permissivity_free_space) / Math.log(GMR / r_m);

      const xcpk = frequency? 1 / (2 * Math.PI * frequency * C) : 0; // ohms per km

      setRlcResults([{
        R: R,
        L: L,
        C: C,
      }]);
      setTotalXlpk(0);
      setTotalXcpk(xcpk);
      setNeutralResistance(0);
      return;
    }

    const gmd_m = gmd_mm / 1000; // Convert mm to m

    const results = conductorArrangements.map((conductor, idx) => {
      const r_m = conductor.circumscribedRadius()

      const permeabilityRelative = conductor.effectivePermeability()
      const resFn = conductor.resistanceFn();
      const GMR = conductor.gmr()

      // Temperature correction for resistivity
      const R = resFn(temperature);
      const L = permeabilityRelative * permeability_of_free_space / (2*Math.PI) * Math.log(gmd_m / GMR); // H/m
      const C = (2 * Math.PI * permissivity_free_space) / Math.log(gmd_m / r_m); // F/m

      return {
        R: R, // all per/m
        L: L,
        C: C,
      };
    });

    setRlcResults(results);

    // L/C is the maximum of the individual values
    const L_max = Math.max(...results.map(res => res.L));
    const C_max = Math.max(...results.map(res => res.C));

    const omega = 2 * Math.PI * frequency; // Angular frequency

    const xl_tot = omega * L_max;
    const cl_tot = 1/(omega * C_max);

    setTotalXlpk(xl_tot * 1000); // Convert to ohms per 1000 m
    setTotalXcpk(cl_tot * 1000);

    // If neutral is selected, calculate its resistance
    if (neutralArrangement !== "" ) {
      const resFn = neutralArrangement.resistanceFn();

      const R = resFn(temperature);
      setNeutralResistance(R * 1000); // Convert to ohms per km
    } else {
      setNeutralResistance(0);
    }
  };

  const conductorPropertyLabel = (conductor) => {
    // get the weighted properties, and return a label for it
    if (!conductor) return conductor.name || "No Name";

    const properties = conductor.weightedProperties;
    let propLabel = properties.map(p => `${p.weight_percent}% ${p.type}`).join(', ');

    if (propLabel.startsWith('100% ')) {
      propLabel =   propLabel.slice(5); // remove '100% ' prefix
    }

    return propLabel ? `${conductor.name} (${propLabel})` : conductor.name;
  }


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
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 4 }}>
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
        <Box sx={{ flex: '0 0 40%', minWidth: 320, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NeutralInput
            neutralArrangement={neutralArrangement}
            setNeutralArrangement={setNeutralArrangement}
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
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 4, mt: 2 }}>
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
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              Reference temperature: 25°C
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
      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'row', gap: 4 }}>
        {/* Left: Summary values */}
        <Box sx={{ flex: 1, minWidth: 250 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Summary</Typography>
          {/* Max phase resistance pk */}

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
            <Typography variant="body1">
              Max Phase Resistance R<sub>pk</sub>: {(() => {
                const rFactor = unit === 'mm' ? 1000 : 304.8;
                const maxR = Math.max(...rlcResults.map(res => res?.R ?? 0));
                return `${(maxR * rFactor).toFixed(3)} Ω/${unit === 'mm' ? 'km' : 'kft'}`;
              })()}
            </Typography>
          </Box>
          {/* Loop resistance pk (max phase + neutral) */}
          {neutralResistance !== "" && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'left'}}>
              <Typography variant="body1">
                Loop Resistance R<sub>loop,pk</sub>:{' '}
                {(() => {
                  const rFactor = unit === 'mm' ? 1000 : 304.8;
                  const maxR = Math.max(...rlcResults.map(res => res?.R ?? 0));
                  if (neutralResistance > 0) {
                    // neutralResistance is in ohms per km, convert if needed
                    const neutralR = unit === 'mm' ? neutralResistance : neutralResistance * 0.3048;
                    const loopR = maxR * rFactor + neutralR;
                    return `${loopR.toFixed(3)} Ω/${unit === 'mm' ? 'km' : 'kft'}`;
                  }
                  return 'N/A';
                })()}
              </Typography>

              <IconButton
                sx={{ p: 0 }}
                aria-label="info"
                color="primary"
                onClick={(e) => handlePopoverOpen(e, <ResistanceLoop />)}
              >
                <InfoOutlinedIcon />
              </IconButton>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'left'}}>
            <Typography variant="body1">
              Total Inductive Reactance XL<sub>pk</sub>: {formatValue(unit === 'mm' ? totalXlpk : totalXlpk * 0.3048)} Ω/{unit === 'mm' ? 'km' : 'kft'}
            </Typography>
            <IconButton
              sx={{ p: 0 }}
              aria-label="info"
              color="primary"
              onClick={(e) => handlePopoverOpen(e, <ReactanceInductance/>)}
            >
              <InfoOutlinedIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
            <Typography variant="body1">
              Total Capacitive Reactance XC<sub>pk</sub>: {formatValue(unit === 'mm' ? totalXcpk : totalXcpk * 0.3048)} Ω/{unit === 'mm' ? 'km' : 'kft'}
            </Typography>
            <IconButton
              sx={{ p: 0 }}
              aria-label="info"
              color="primary"
              onClick={(e) => handlePopoverOpen(e, <ReactanceCapacitance/>)}
            >
              <InfoOutlinedIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Right: Per-phase values */}
        <Box sx={{ flex: 1, minWidth: 250 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Per-phase Values</Typography>
          {conductorArrangements.map((conductor, idx) => {
            if (
              !rlcResults[idx]
            ) {
              return null;
            }

            const lengthLabel = unit === 'mm' ? 'km' : 'kft';
            const rFactor = unit === 'mm' ? 1000 : 304.8;
            const lFactor = unit === 'mm' ? 1 : 0.3048;
            const cFactor = unit === 'mm' ? 1 : 0.3048;

            return (
              <Box key={idx} sx={{ mb: 1, display: 'flex', flexDirection: 'row',  }}>
                <Box>
                  <Typography variant="subtitle1">
                    Phase {phase[idx]} 
                  </Typography>
                  <Typography variant="subtitle2">
                    {conductorPropertyLabel(conductor)}
                  </Typography>
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                    <Typography variant="body2">
                      Resistance R: {(rlcResults[idx].R * rFactor).toFixed(3)} Ω/{lengthLabel}
                    </Typography>
                    <IconButton
                      sx={{ p: 0 }}
                      aria-label="info"
                      color="primary"
                      onClick={(e) => handlePopoverOpen(e, <Resistance/>)}
                    >
                      <InfoOutlinedIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                    <Typography variant="body2">
                      Inductance L: {formatValue(rlcResults[idx].L * lFactor)} H/{lengthLabel}
                    </Typography>
                    <IconButton
                      sx={{ p: 0 }}
                      aria-label="info"
                      color="primary"
                      onClick={(e) => handlePopoverOpen(e, <Inductance/>)}
                    >
                      <InfoOutlinedIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                    <Typography variant="body2">
                      Capacitance C: {formatValue(rlcResults[idx].C * cFactor)} F/{lengthLabel}
                    </Typography>
                    <IconButton
                      sx={{ p: 0 }}
                      aria-label="info"
                      color="primary"
                      onClick={(e) => handlePopoverOpen(e, <Capacitance/>)}
                    >
                      <InfoOutlinedIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            );
          })}
          {neutralResistance !== 0 && neutralArrangement !== "" && (
            <Box sx={{ mb: 1, display: 'flex', flexDirection: 'row' }}>
              <Box>
                <Typography variant="subtitle1">
                  Neutral
                </Typography>
                <Typography data-testid="neutral-res" variant="subtitle2">
                  {conductorPropertyLabel(neutralArrangement)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2">
                  Resistance R: {(() => {
                    const neutralR = unit === 'mm' ? neutralResistance : neutralResistance * 0.3048;
                    const lengthLabel = unit === 'mm' ? 'km' : 'kft';
                    return `${neutralR.toFixed(3)} Ω/${lengthLabel}`;
                  })()}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
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