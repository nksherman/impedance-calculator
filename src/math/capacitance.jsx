import React from "react";
import "katex/dist/katex.min.css";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { BlockMath } from "react-katex";

const Capacitance = () => (
  <Box sx={{ p: 2 }}>
    <Typography>Capacitance</Typography>
    <BlockMath math={
      String.raw`C/length = 2\pi ε_0 / 
        {\text{Ln}(\frac{GMD}{r_o})}`
    } />
    <Typography>where</Typography>
    <BlockMath math={
      String.raw`\begin{matrix}
        ε_0 = \text{Vacuum permittivity} \\
        \text{GMD} = \text{Geometric Mean Distance} \\
        r_o = \text{Circumscribing Radius}
      \end{matrix}`
    } />
  </Box>
);

export default Capacitance;