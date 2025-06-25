import React from "react";
import "katex/dist/katex.min.css";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { BlockMath } from "react-katex";

const Inductance = () => (
  <Box sx={{ p: 2 }}>
    <Typography>Inductance</Typography>
    <BlockMath math={
      String.raw`L/length = \frac
        {μ_r*μ_0}
        {2\pi}
        * Ln(\frac{GMD}{GMR_i})`
    } />
    <Typography>where</Typography>
    <BlockMath math={
      String.raw`\begin{matrix}
        μ_r = \text{relative permeability}  \\
        μ_0 = \text{permeability of free space}  \\
        GMD = \text{System Geometric Mean Distance}  \\
        GMR_i = \text{Geometric Mean Radius of Phase}
      \end{matrix}`
    } />
  </Box>
);

export default Inductance;