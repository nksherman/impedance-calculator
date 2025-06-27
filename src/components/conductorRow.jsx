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
import ConductorStrandGraphic from './conductor/conductorStrandGraphic';

import { SolidConductor, StrandedConductor } from './conductor/conductorModel.ts';

function ConductorRow({ 
  conductor, 
  rowName, 
  handleConductorChange, 
  handlePropertyChange,
  handlePopoverOpen,
  conductorData,
  conductorProperties
}) {
 

  const currentConductorIndex = conductorData.findIndex(c => c.name === conductor.name);
  const currentPropertyIndex = conductorProperties.findIndex(p => p.type === conductor.properties?.type);

  const conductorSelectId = `conductor-select-${rowName}`;
  const conductorLabelId = `conductor-label-${rowName}`;
  const materialSelectId = `material-select-${rowName}`;
  const materialLabelId = `material-label-${rowName}`;


  const handleDisplayStrands = (conductor) => {
    // Display the conductor strands in a popover or modal

    let theseStrands = null;

    if (conductor instanceof StrandedConductor) {
        // stranded, display the strands
        theseStrands = conductor.arrangement
    } else if (conductor instanceof SolidConductor) {
      theseStrands = [{
        r: 0,
        theta: 0,
        radius: conductor.radius
      }];

    } else {
      // Not a valid conductor type, return null or handle error
      console.error("Invalid conductor type for strand display");
      return;
    }

    return <ConductorStrandGraphic strands={theseStrands} />;
  }


  const formatConductorInfo = (conductor, data, props) => {
    if (!data && !props) return <Typography variant="body1">No data available</Typography>;
    return (
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Box sx={{ flex : 1, mr: 2 }}>
          {handleDisplayStrands(conductor)}
          {data && (
            <>
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
            </>
          )}
        </Box>
        <Box>
          {props && (
            <>
              <Typography variant="body1"><strong>Type:</strong> {props.type}</Typography>
              <Typography variant="body1"><strong>Ref Temp:</strong> {props.temp_reference ?? props.ref_temp}°C</Typography>
              <Typography variant="body1"><strong>Resistivity:</strong> {props.resistivity} Ω·m</Typography>
              <Typography variant="body1"><strong>Temp Coef of Res.:</strong> {props.temp_coef_of_resistivity} 1/°C</Typography>
              <Typography variant="body1"><strong>Relative Permeability:</strong> {props.permeability_relative}</Typography>
              <Typography variant="body1"><strong>Conductivity:</strong> {props.conductivity} S/m</Typography>
            </>
          )}
        </Box>
      </Box>
    );
  };

  const conductorInfo = formatConductorInfo(
    conductor,
    conductorData[currentConductorIndex], 
    conductorProperties[currentPropertyIndex]
  );

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
          {conductorData.map((opt, i) => (
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
          {conductorProperties.map((opt, i) => (
            <MenuItem key={opt.type} value={i}>{opt.type}</MenuItem>
          ))}
        </Select>
      </FormControl>
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