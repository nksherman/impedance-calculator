import React from "react";
import "katex/dist/katex.min.css";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { BlockMath } from "react-katex";

const Resistance = () => (
  <Box sx={{ p: 2 }}>
    <Typography>Resistance</Typography>
    <BlockMath math={
      String.raw`R/length = \frac{\rho}{SA}*(1+\alpha_{T_0}* (T -T_0)`
    } />
    <Typography>where</Typography>
    <BlockMath math={
      String.raw`\begin{matrix}
        \rho = \text{Resistivity} \\
        \text{SA} = \text{Surface Area of Conductor} \\
        \alpha_{T_0} = \text{temperature coefficient of resistance} \\
        T = \text{Target Temperature} \\
        T_0 = \text{Reference Temperature}
      \end{matrix}`
    } />
    <Typography>*Resistance does not linearly vary with temperature.</Typography>
    <Typography>Expect large error margins at higher temperature differences.</Typography>
  </Box>
);

export default Resistance;