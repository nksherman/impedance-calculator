import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const KFactor = () => (
  <Box sx={{ p: 2 }}>
    <Typography>K-Factor</Typography>
    <BlockMath math={
      String.raw`K = \frac{R*PF+(X_L-X_C)*\text{sin}(\text{cos}^{-1}(PF))}{k \cdot V_{base}}`
    } />
    <Typography>and</Typography>
    <BlockMath math={
      String.raw`V_d = K \cdot kVA_{load} \cdot L / 1000`
    } />

    <Typography>where</Typography>
    <BlockMath math={
      String.raw`\begin{matrix}
        k = \text{Phase multiplier (}\sqrt{3}\text{ for 3-phase, 2 for 1-phase)} \\
        V_{base} = \text{Base voltage }(\text{V}_\text{LL} \text{ for 3-phase, V}_\text{LN} \text{ for 1-phase)} \\
        PF = \text{Power factor}
      \end{matrix}`
    } />
  </Box>
);

export default KFactor;