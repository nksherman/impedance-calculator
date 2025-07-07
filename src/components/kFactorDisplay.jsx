// component for calculating K-factor for some arrangement and resistnace/reactance

import React from 'react';

import { Box, Typography } from '@mui/material';



function KFactorDisplay({ rlcResults, totalXlpk, totalXcpk, neutralResistance, unit }) {
  // vDrop = K * L * L

  // K = R +j(Xl - Xc)
  // phaseAngle = Math.atan2(totalXlpk - totalXcpk, neutralResistance);
  // PF  = cos(phaseAngle) 

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
      <Typography variant="h6">K-Factor</Typography>
      <Typography variant="body1">This component will display the K-factor for the selected conductor arrangement.</Typography>
      {/* Additional content can  be added here */}
    </Box>
  );
}

export default KFactorDisplay;