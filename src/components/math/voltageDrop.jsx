import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const VoltageDrop = () => (
  <Box sx={{ p: 2 }}>
    <Typography>Voltage Drop</Typography>
    <BlockMath math={
      String.raw`\begin{matrix}
      V_d = I \cdot Z \cdot L \\
      I = \frac{{\text{kVA}}_{load}}{k \cdot V_{base} \cdot PF} \\
      \end{matrix}`
    } />
    <Typography>or</Typography>
    <BlockMath math={
      String.raw`\begin{matrix}
      V_d = K \cdot kVA_{load} \cdot L / 1000 \\
      K = \frac{Z}{k \cdot V_{base} \cdot PF} \\
      \end{matrix}`
    } />
    <Typography>where</Typography>
    <BlockMath math={
      String.raw`\begin{matrix}
        Z = \text{Impedance, }\sqrt{(R^2 + X^2)} \text{ (}\Omega\text{)} \\
        k = \text{Phase multiplier (}\sqrt{3}\text{ for 3-phase, 1 for 1-phase)} \\
        V_{base} = \text{Base voltage }(\text{V}_\text{LL} \text{ for 3-phase, V}_\text{LN} \text{ for 1-phase)} \\
        PF = \text{Power factor}
      \end{matrix}`
    } />
  </Box>
);

export default VoltageDrop;