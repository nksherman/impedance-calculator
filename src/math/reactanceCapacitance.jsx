import React from "react";
import "katex/dist/katex.min.css";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { BlockMath } from "react-katex";

const ReactanceCapacitance = () => (
  <Box sx={{ p: 2 }}>
    <Typography>Capacitance</Typography>
    <BlockMath math={
      String.raw`\begin{matrix}
        X_c/length = 1 / ( 2\pi{f}* (C/length) ) \\
        C/length = 2\pi ε_r ε_0 / {\text{Ln}(\frac{GMD}{r_o})} \\
        \end{matrix}`
    } />
    <Typography>where</Typography>
    <BlockMath math={
      String.raw`\begin{matrix}
        X_c = \text{Capacitive Reactance} \\
        f = \text{Frequency} \\
        C/length = \text{Capacitance per unit length} \\
        ε_r = \text{Relative permittivity} \\
        ε_0 = \text{Vacuum permittivity} \\
        \text{GMD} = \text{Geometric Mean Distance} \\
        r_o = \text{Circumscribing Radius}
      \end{matrix}`
    } />
    <Typography>*ideal conductors have infinite permittivity and zero Capacitance</Typography>
    <Typography>*This calculation assume relative permittivity is 1</Typography>
  </Box>
);

export default ReactanceCapacitance;