# Impedance Calculator

An interactive web tool for calculating the Geometric Mean Radii (GMR), Geometric Mean Distance (GMD), Resistance, and Reactance for arbitrary conductor arrangements. Displays governing formulas with overrides for different conductor sizes and materials.

## Usage

1. Select the number and type of conductors.
2. Enter distances between conductors.
3. Optionally, enable manual GMD override to input a custom value.
4. Click "Calculate GMD" to compute the result.
5. Download the conductor data to add new conductors.

We will be adding support for insulation effects, bundled/multi-conductor phases, k-factor calculations, cable-in-conduit GMR/GMD, and composite strands(ACSR). 

### Notes on Calculated Values

Actual resistance and reactance will vary because of 
1.  Imperfections in the material
2.  Skin effects at higher frequencies
3.  GMR for stranded conductors will be overestimated
4.  Resistivity does not vary linearly with temperature.

## Live Demo

Access the app here: [Impedance Calculator on GitHub Pages](https://nksherman.github.io/impedance-calculator/)

## Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/impedance_calculator.git
   cd impedance_calculator
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

## Building for Production & Downloading

To create a production build (for static hosting or direct download):

```bash
npm run build
```

- The optimized static files will be output to the `build/` directory.
- You can download or copy the contents of the `build/` folder to any static web server or host them directly (e.g., GitHub Pages, Netlify, S3, etc).
- To rebuild completely, delete the `build/` directory and rerun `npm run build`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
