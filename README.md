# Impedance Calculator

This project is an interactive tool for calculating the Geometric Mean Distance (GMD) and related parameters for electrical conductors. It supports both metric (mm) and imperial (in) units, and allows for manual override of GMD values.

## Features

- Input conductor distances and radii
- Support for multiple conductors and optional neutral
- Automatic and manual GMD calculation
- Unit conversion between mm and inches
- Error handling for invalid inputs

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

### Installation

```bash
git clone https://github.com/yourusername/impedance_calculator.git
cd impedance_calculator
npm install
```

### Running the App

```bash
npm start
```

The app will be available at `http://localhost:3000`.

### Running Tests

```bash
npm test
```

## Project Structure

- `src/components/` - React components (including `DistanceMatrix`)
- `src/data/` - JSON data and utility functions for conductors
- `src/App.js` - Main application entry point

## Usage

1. Select the number and type of conductors.
2. Enter distances between conductors.
3. Optionally, enable manual GMD override to input a custom value.
4. Click "Calculate GMD" to compute the result.

## License

MIT
