import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import QuestionMarkIcon from '@mui/icons-material/HelpOutline';

import GrainIcon from '@mui/icons-material/Grain';

import GMR from '../math/gmr.jsx';
import { createConductor, getConductorDataByName, getPropertiesByType } from './conductorHelpers';
import ConductorStrandGraphic from './conductor/conductorStrandGraphic';

import { SolidConductor, StrandedConductor } from './conductor/conductorModel.ts';
 
/**
 * ConductorRow component displays information about a single conductor.
 * 
 * @param {SolidConductor | StrandedConductor} conductor
 * @param {string} rowName - Name of the row (e.g., "A", "B", etc.)
 * @param {function} handleConductorChange - Callback to handle conductor selection change
 * @param {function} handlePropertyChange - Callback to handle material property selection change
 * @param {function} handleCorePropertyChange - Callback to handle core material property selection change
 * @param {function} handlePopoverOpen - Callback to open a popover with conductor info
 * @param {Array} conductorDataArray - Array of conductor data objects
 * @param {Array} conductorPropertiesArray - Array of conductor material properties
 * 
 * @returns 
 * JSX element representing the conductor row with selection controls and info popover.
 */

function ConductorRow({ 
  conductor, 
  rowName, 
  handleConductorChange, 
  handlePropertyChange,
  handleCorePropertyChange,
  handlePopoverOpen,
  conductorDataArray,
  conductorPropertiesArray
}) {
  const handleDisplayStrands = (conductor) => {
    // Display the conductor strands in a popover or modal
    let theseStrands = null;
    // Use property-based type checks for testability
    if (conductor && conductor.arrangement) {
      // stranded, display the strands
      theseStrands = conductor.arrangement;
    } else if (conductor && !conductor.arrangement && 'radius' in conductor) {
      theseStrands = [{
        r: 0,
        theta: 0,
        radius: conductor.radius
      }];
    } else {
      // Not a valid conductor type, return null or handle error
      return null;
    }

    return <ConductorStrandGraphic strands={theseStrands} />;
  } 

  // Get weighted properties array
  const weightedProps = conductor.weightedProperties || [];
  const thisProperty = conductor.conductorProperties || null;
  const coreProperty = conductor.coreProperties || null;

  const formatConductorInfo = (conductor, data) => {
    if (!data && weightedProps.length === 0) return <Typography variant="body1">No data available</Typography>;

    return (
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          {handleDisplayStrands(conductor)}
          {data && (
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
              <Typography variant="body1"><strong>Name:</strong> {data.name}</Typography>
              <Typography variant="body1"><strong>Strands:</strong> {data.strand_count}</Typography>
              <Typography variant="body1"><strong>Strand dia:</strong> {data.strand_dia ?? data.strand_dia} mm</Typography>
              <Typography variant="body1"><strong>Outer dia:</strong> {data.outer_dia} mm</Typography>
              {'core_strand_count' in data && (
                <>
                  <Typography variant="body1"><strong>Core Strands:</strong> {data.core_strand_count}</Typography>
                  <Typography variant="body1"><strong>Core Strand Dia:</strong> {data.core_strand_dia ?? data.core_strand_dia} mm</Typography>
                </>
              )}
              <Box sx={{ mb: 1 }} />
            </Box>
          )}
        </Box>
        <Box>
          {weightedProps.length > 0 && weightedProps.map((wp, idx) => (
            <Box key={idx} sx={{ mb: 1, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
              {/* TODO: Indicate if this is core or other property */}
              <Typography variant="body2"><strong>Type:</strong> {wp.type}</Typography>
              <Typography variant="body2"><strong>Weight %:</strong> {wp.weight_percent.toFixed(2)}%</Typography>
              {'surface_area' in wp && (
                <Typography variant="body2"><strong>Surface Area:</strong> {(wp.surface_area * 1000000).toFixed(2)} mm²</Typography>
              )}
              <Typography variant="body2"><strong>Ref Temp:</strong> {wp.temp_reference}°C</Typography>
              <Typography variant="body2"><strong>Resistivity:</strong> {wp.resistivity} Ω·m</Typography>
              <Typography variant="body2"><strong>Temp Coef of Res.:</strong> {wp.temp_coef_of_resistivity} 1/°C</Typography>
              <Typography variant="body2"><strong>Relative Permeability:</strong> {wp.permeability_relative}</Typography>
              <Typography variant="body2"><strong>Conductivity:</strong> {wp.conductivity} MS/m</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const currentConductorIndex = conductorDataArray.findIndex(c => c.name === conductor.name);
  const currentPropertyIndex = thisProperty ? conductorPropertiesArray.findIndex(p => p.type === thisProperty?.type) : -1;
  const currentCorePropertyIndex = coreProperty ? conductorPropertiesArray.findIndex(p => p.type === coreProperty?.type) : -1;

  const conductorInfo = formatConductorInfo(
    conductor,
    conductorDataArray[currentConductorIndex]
  );

  const conductorSelectId = `conductor-select-${rowName}`;
  const conductorLabelId = `conductor-label-${rowName}`;
  const materialSelectId = `material-select-${rowName}`;
  const materialLabelId = `material-label-${rowName}`;
  const coreMaterialSelectId = `core-material-select-${rowName}`;
  const coreMaterialLabelId = `core-material-label-${rowName}`;


  return (
    <>
      <FormControl sx={{ mr: 2, minWidth: 120 }}>
        <InputLabel id={conductorLabelId}>{`Conductor ${rowName}`}</InputLabel>
        <Select 
          labelId={conductorLabelId}
          id={conductorSelectId}
          value={currentConductorIndex >= 0 ? currentConductorIndex : 0}
          label={`Conductor ${rowName}`}
          onChange={e => handleConductorChange(e.target.value)}
        >
          {conductorDataArray.map((opt, i) => (
            <MenuItem key={opt.name} value={i}>{opt.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ mr: 2, minWidth: 120 }}>
        <InputLabel id={materialLabelId}>{`Material ${rowName}`}</InputLabel>
        <Select
          labelId={materialLabelId}
          id={materialSelectId}
          value={currentPropertyIndex >= 0 ? currentPropertyIndex : 0}
          label={`Material ${rowName}`}
          onChange={e => handlePropertyChange(e.target.value)}
        >
          <MenuItem value={""} disabled>none</MenuItem>
          {conductorPropertiesArray.map((opt, i) => (
            <MenuItem key={opt.type} value={i}>{opt.type}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Conditional Core Material Select */}
      {coreProperty ? (
        <FormControl sx={{ mr: 2, minWidth: 120 }}>
          <InputLabel id={coreMaterialLabelId}>{`Core Material ${rowName}`}</InputLabel>
          <Select
            labelId={coreMaterialLabelId}
            id={coreMaterialSelectId}
            value={currentCorePropertyIndex >= 0 ? currentCorePropertyIndex : 0}
            label={`Core Material ${rowName}`}
            onChange={e => handleCorePropertyChange(e.target.value)}
          >
            <MenuItem value={""} disabled>none</MenuItem>
            {conductorPropertiesArray.map((opt, i) => (
              <MenuItem key={opt.type} value={i}>{opt.type}</MenuItem>
            ))}
          </Select>
        </FormControl>): null 
      }

      {/* <FormControl sx={{ mr: 2, minWidth: 120 }}>
        <InputLabel id={insulatorLabelId}>{`Insulator ${rowName}`}</InputLabel>
        <Select
          labelId={insulatorLabelId}
          id={insulatorSelectId}
          value={insulatorIndices[idx]}
          label={`Insulator ${rowName}`}
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
            'aria-label': `Insulator Thickness ${rowName}`,
            min: 0,
            step: 0.01
          }}
        />
      )} */}

      {/*  Other stuff */}

      <Tooltip title="Data for conductor">
        <IconButton
          aria-label="info"
          onClick={e => handlePopoverOpen(e, conductorInfo)}
          size="large"
          sx={{ ml: 1 }}
        >
          <QuestionMarkIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="equation for GMR">
        <IconButton
          aria-label="info"
          onClick={e => handlePopoverOpen(e, <GMR />)}
          size="large"
          sx={{ ml: 1 }}
        >
          <InfoOutlinedIcon />
        </IconButton>
      </Tooltip>
    </>
  )
}


export default ConductorRow;