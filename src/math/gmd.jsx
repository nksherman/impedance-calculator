import React from "react";
import "katex/dist/katex.min.css";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { BlockMath } from "react-katex";

const GMD = () => (
  <Box sx={{ p: 2 }}>
    <Typography>General GMD Formula</Typography>
    <BlockMath math={
      String.raw`GMD = \sqrt[N]{D_{AB}*D_{AC}*D_{BC}*...}`
    } />
    <Typography>where</Typography>
    <BlockMath math={
      String.raw`\begin{matrix}
      N = \text{Unique Strands} \\
      D_{ij} = \text{Each Unique Seperation}
      \end{matrix}`
    } />
  </Box>
);

export default GMD;