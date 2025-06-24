import React from "react";
import "katex/dist/katex.min.css";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { BlockMath } from "react-katex";

const GMR = () => (
  <Box sx={{ p: 2 }}>
    <Typography>General GMR Formula</Typography>
    <BlockMath math={
      String.raw`GMR=
        \sqrt[N^2]{\prod_{i=1}^N \left( r'_i \prod_{\substack{j=1 \\ j \ne i}}^N D_{ij} \right)} 
        = 
        \sqrt{%
        \begin{matrix}
          (r'_1 \cdot D_{12} \cdot D_{13} \cdots D_{1N}) \\
          (r'_2 \cdot D_{21} \cdot D_{23} \cdots D_{2N}) \\
          \vdots \\
          (r'_N \cdot D_{N1} \cdot D_{N2} \cdots D_{N(N-1)})
        \end{matrix}
      }`
    } />
    <Typography>where</Typography>
    <BlockMath math={
      String.raw`\begin{matrix}
        r'_i = D_{ii} = GMR_i \text { or  }   \\
        r'_{strand} = r_{outer}*e^{\frac{-1}{4}}    \\ \\
        D_{ij} = \begin{matrix}
                \text{center distance between} \\ 
                \text{strands i and j}
                \end{matrix}
        \end{matrix}`
    } />
  </Box>
);

export default GMR;