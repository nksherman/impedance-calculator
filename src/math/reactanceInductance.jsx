import React from "react";
import "katex/dist/katex.min.css";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { BlockMath } from "react-katex";

const ReactanceInductance = () => (
  <Box sx={{ p: 2 }}>
    <Typography>Inductance</Typography>
    <BlockMath math={
      String.raw`\begin{matrix}
        X_L/length = 2\pi{f}* (L/length)  \\
        L/length = \frac
                {μ_r*μ_0}
                {2\pi}
                * Ln(\frac{GMD}{GMR_i}) \\
        \end{matrix}`
    } />
    <Typography>where</Typography>
    <BlockMath math={
      String.raw`\begin{matrix}
        X_L = \text{Inductive Reactance}  \\
        f = \text{Frequency}  \\
        L/length = \text{Inductance per unit length}  \\
        μ_r = \text{relative permeability}  \\
        μ_0 = \text{permeability of free space}  \\
        GMD = \text{System Geometric Mean Distance}  \\
        GMR_i = \text{Geometric Mean Radius of Phase}
      \end{matrix}`
    } />
  </Box>
);

export default ReactanceInductance;