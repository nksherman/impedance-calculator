import React from "react";
import "katex/dist/katex.min.css";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { BlockMath } from "react-katex";

const ResistanceLoop = ({explain = true}) => (
  <Box sx={{ p: 2 }}>
    <Typography>Resistance</Typography>
    <BlockMath math={
      String.raw`R_{loop}/length = \begin{matrix}
        \frac{\rho_l}{SA_l}*(1+\alpha_{l,T_0}* (T -T_{l0}) + \\
        \frac{\rho_n}{SA_n}*(1+\alpha_{n,T_0}* (T -T_{n0}) \\
        \end{matrix}`
    } />
    {explain && (
      <>
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
      </>
    )}
    <Typography>*Sum of the phase and neutral resistances</Typography>
  </Box>
);

export default ResistanceLoop;