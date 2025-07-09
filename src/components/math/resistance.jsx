import React from "react";
import "katex/dist/katex.min.css";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { BlockMath } from "react-katex";

const Resistance = () => (
  <Box sx={{ p: 2 }}>
    <Typography>Resistance</Typography>
    <BlockMath math={
      String.raw`R/length = \frac{\rho}{\text{SA}_{cond}}*(1+\alpha_{T_0}* (T -T_0)`
    } />
    <Typography>Higher frequencies and large Conductors</Typography>
    <Typography>will mostly conduct within the skin depth, delta</Typography>
    <BlockMath math={
      String.raw`\begin{matrix}
        \delta = \sqrt{\frac{\rho}{\pi*f*μ_r*μ_0}} \\
        SA_{cond} =\text{{Conductive Area}} = \pi r^2 - \pi({r-\delta})^2\\
        \end{matrix}`
    } />
    <Typography>where</Typography>
    <BlockMath math={
      String.raw`\begin{matrix}
        \rho = \text{Resistivity} \\
        \text{SA}_{cond} = \text{ Conductive Surface Area of Conductor} \\
        \alpha_{T_0} = \text{temperature coefficient of resistance} \\
        T = \text{Target Temperature} \\
        T_0 = \text{Reference Temperature} \\
        μ_r = \text{relative permeability}  \\
        μ_0 = \text{permeability of free space}  \\
      \end{matrix}`
    } />
    <Typography>*Resistance does not linearly vary with temperature.</Typography>
    <Typography>Expect large error margins at higher temperature differences.</Typography>
  </Box>
);

export default Resistance;