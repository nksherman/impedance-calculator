import { gmr } from "../../calculators/gmr";
import  { ConductorProperties, ConductorData, insulatorType } from "../../data/conductorModels";

// Each arrangement has some total number of strands, and 

// TotalStrands: {
//   1: Total = 3*N*(N-1)+1,
//   2: Total = 3*N*N,
//   3: Total = (3N+1)*N
//   4: null
//   5: Total = N*3*(N-1)+interface(Rin *pi/r1)
// }

const StrandPerLayer = {
  1: [1, 6, 12, 18, 24, 30, 36, 42],
  2: [3, 9, 15, 21, 27, 33, 39, 45],
  3: [4, 10, 16, 22, 28, 34, 40, 46],
  // 4: null
  // 5: {center different size}
}

const patternsTotal = {
  1: [1, 7, 19, 37, 61, 91, 127, 169],
  2: [3, 12, 27, 48, 75, 108, 147, 192],
  3: [4, 14, 30, 52, 80, 114, 154, 200],
  // 4: {Any incomplete layer, user input},
  // 5: {Center strand different size},
}

type RadialCoordinate = {
  r: number; // radius
  theta: number; // angle in radians
  radius: number; // radius for the strand
} 

// short property object for grouping
type ConductorGroup = {
  resistivity: number; // ohm-meter
  temp_coef_of_resistivity: number; // per degree Celsius
  temp_reference: number; // reference temperature in degrees Celsius
  totalSurfaceArea: number; // total surface area of the group in square meters
}

type RadialCoordinateWithProperties = RadialCoordinate & {
  properties: ConductorProperties;
}

abstract class Conductor {

  abstract gmr(): number;
}

abstract class StrandedConductor extends Conductor {
  public strandArrangement: RadialCoordinateWithProperties[] = [];

  constructor() {
    super();
  }
  
  calculateDistance(coord1: RadialCoordinate, coord2: RadialCoordinate): number {
    // Convert polar coordinates to Cartesian coordinates
    const x1 = coord1.r * Math.cos(coord1.theta);
    const y1 = coord1.r * Math.sin(coord1.theta);
    const x2 = coord2.r * Math.cos(coord2.theta);
    const y2 = coord2.r * Math.sin(coord2.theta);

    // Calculate Euclidean distance
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  generateDistanceMatrix(): number[][] {
    const distanceMatrix: number[][] = [];

    for (let i = 0; i < this.strandArrangement.length; i++) {
      const row: number[] = [];
      for (let j = 0; j < this.strandArrangement.length; j++) {
        if (i === j) {
          const radius = this.strandArrangement[i].radius;
          row.push(radius * Math.exp(-0.25)); // Distance to itself is it's radius
        } else {
          const distance = this.calculateDistance(this.strandArrangement[i], this.strandArrangement[j]);
          row.push(distance);
        }
      }
      distanceMatrix.push(row);
    }

    return distanceMatrix;
  }

  /** 
   * Conductor Specific Methods
   * */ 
  
  gmr(): number {
    // Calculate the geometric mean radius (GMR) for the arrangement
    const oneStrand = this.strandArrangement[0];
    const rad = oneStrand.radius;


    return gmr(this.generateDistanceMatrix()); 
  }

  groupedResistivity(): ConductorGroup[] {
    const groupedStrands: { resistivity: number; temp_coef_of_resistivity: number; temp_reference: number, totalSurfaceArea: number }[] = [];

    this.strandArrangement.forEach((strand) => {
      const { resistivity, temp_coef_of_resistivity, temp_reference } = strand.properties;
      const radius = strand.radius;
      if (radius === undefined) {
        throw new Error("Radius is required to calculate surface area.");
      }

      const surfaceArea = Math.PI * radius * radius; 

      // Check if a group with the same resistivity and temp_coef_of_resistivity already exists
      const existingGroup = groupedStrands.find(
        (group) =>
          group.resistivity === resistivity 
          && group.temp_coef_of_resistivity === temp_coef_of_resistivity 
          && group.temp_reference === temp_reference
      );

      if (existingGroup) {
        // Accumulate surface area in the existing group
        existingGroup.totalSurfaceArea += surfaceArea;
      } else {
        // Create a new group
        groupedStrands.push({
          resistivity,
          temp_coef_of_resistivity,
          temp_reference,
          totalSurfaceArea: surfaceArea,
        });
      }
    });

    return groupedStrands;
  }

  resistivityFunction(): (temperature: number) => number {
    // Returns Ohm/meter(length) at a given temperature

    const groupedStrands = this.groupedResistivity();

    // Return a function to calculate resistance per unit length at a given temperature
    return (temperature: number): number => {
      let totalResistancePerLength = 0;

      groupedStrands.forEach(({ resistivity, temp_coef_of_resistivity, totalSurfaceArea }) => {
        // Adjust resistivity based on temperature
        const adjustedResistivity = resistivity * (1 + temp_coef_of_resistivity * (temperature - 20)); // Assuming 20°C reference

        // Multiply adjusted resistivity by total surface area
        totalResistancePerLength += adjustedResistivity * totalSurfaceArea;
      });

      return totalResistancePerLength;
    };
  }
}

function closePackedCore(strands: number, radius: number): RadialCoordinate[] {
  if ( strands  === 1 ) {
    return [{ r: 0, theta: 0, radius }]; // single strand at the center
  } else if ( strands === 2 ) {
    // side by side
    return [
      { r: radius, theta: 0, radius },
      { r: radius, theta: Math.PI, radius }
    ]
  } else if ( strands === 3) {
    const rad = radius / Math.sqrt(3);
    return [
      { r: rad, theta: 0, radius},
      { r: rad, theta: (2 * Math.PI) / 3, radius },
      { r: rad, theta: 2*(2 * Math.PI) / 3, radius }
    ];
  } else if (strands == 4 ) {
    const rad = radius * Math.sqrt(8);
    return [
      { r: rad, theta: 0, radius },
      { r: rad, theta: Math.PI / 2, radius },
      { r: rad, theta: Math.PI, radius },
      { r: rad, theta: (3 * Math.PI) / 2, radius }
    ];
  } else {
    throw new Error("Unsupported number of strands for close packing");
  }
}

function packLayer(circumRad: number, strandsLeft: number, rad: number): RadialCoordinate[] {    
  // for the circumference radius, pack X circles of radius rad around it
  // parent will count and dedent strandsLeft
  const layerArrangement: RadialCoordinate[] = [];

  if (circumRad === 0) {
    // layer just core, centered strand

    return [{ r: 0, theta: 0, radius: rad }];
  }
  
  const circum = Math.PI*circumRad*2;

  let thisPack = Math.floor(circum / (rad * 2));

  if (thisPack <= 0) {
    throw new Error("Cannot pack any strands in this layer");
  } else if (thisPack > strandsLeft) {
    thisPack = strandsLeft; // pack remaining
  }
  const angleIncrement = (2 * Math.PI) / thisPack;
  for (let i = 0; i < thisPack; i++) {
    const theta = i * angleIncrement;
    layerArrangement.push({ r: circumRad, theta, radius: rad });
  }
  return layerArrangement;
}

class ConductorArrangement extends StrandedConductor {
  public strandArrangement: RadialCoordinateWithProperties[] = [];

  constructor(
    N: number,
    rad: number,
    properties: ConductorProperties
  ) {
    super();
    if (N < 1) {
      this.strandArrangement = [];
      return;
    }

    const strands = this.GetArrangementMatrix(N, rad);
    this.strandArrangement = strands.map(coord => ({
      ...coord,
      properties: { ...properties } // inject properties
    }));
  }

  private getLayers(N: number): number[] {

    if (N in patternsTotal[1]) {
      // get the index in patternsTotal[1]
      const index = patternsTotal[1].findIndex(value => {value === N});
      return patternsTotal[1].slice(0, index + 1); // Pattern 1
    }
    if (N in patternsTotal[2]) {
      const index = patternsTotal[2].findIndex(value => value === N);
      return patternsTotal[2].slice(0, index + 1); // Pattern 2
    }
    if (N in patternsTotal[3]) {
      const index = patternsTotal[3].findIndex(value => value === N);
      return patternsTotal[3].slice(0, index + 1); // Pattern 3
    }
    else {
      return [] // Pattern 4 for any incomplete layer
    }
  }

  packLayer(circumRad: number, strandsLeft: number, rad: number): RadialCoordinate[] {
    return packLayer(circumRad, strandsLeft, rad);
  }

  GetArrangementMatrix( N: number, rad: number) : RadialCoordinate[] {
    // get pattern from Number
    let strandArrangement: RadialCoordinate[] = []
    const layerPattern = this.getLayers(N);
    if (layerPattern.length === 0 && N < 5) {
      // simple close packed core
      return closePackedCore(N, rad);

    } else  if (layerPattern.length === 0) {
      let circum: number = 0;
      let strandsLeft: number = N;
      while (strandsLeft > 0) {
        const nextLayers = this.packLayer(circum, strandsLeft, rad);

        strandsLeft -= nextLayers.length;

        if (strandsLeft < 0) {
          throw new Error(`when Packing ${N} strands, layered ${nextLayers.length} strands, but strands left with: ${strandsLeft}.` )
        }
        strandArrangement = [...strandArrangement, ...nextLayers];

        // update the circum, circum cender + (inner) rad + (next layer) rad
        circum += rad + rad;
      }
      return strandArrangement;
    }

    let circumRad = 0
    for (let i = 0; i < layerPattern.length; i++) {
      const strandsInLayer = layerPattern[i];

      if (circumRad === 0) {
        // if first layer is one, 
        if  (0 < strandsInLayer && strandsInLayer < 5 ) {
          strandArrangement = [...strandArrangement, ...closePackedCore(strandsInLayer, rad)]
        } else {
          throw new Error("Unsupported first layer arrangement");
        }

        //update the circumRad, circum cender + (inner) rad + (next layer) rad
        circumRad = rad + rad + strandArrangement.reduce((max, coord) => Math.max(max, coord.r), 0);
      }

      // for strandsInLayer, equally distribute them around the circumference
      else if (strandsInLayer > 0) {
        const angleIncrement = (2 * Math.PI) / strandsInLayer;
        for (let j = 0; j < strandsInLayer; j++) {
          const theta = j * angleIncrement;
          strandArrangement.push({ r: circumRad, theta, radius: rad });
        }
      } else {
        // pack as many
        const layerArrangement = this.packLayer(circumRad, strandsInLayer, rad);

        // any left?
        const strandsLeft = strandsInLayer - layerArrangement.length;
        if (strandsLeft > 0) {
          throw new Error("Not enough strands to pack in this layer");
        } else if (strandsLeft < 0) {
          throw new Error("Too many strands to pack in this layer");
        } 
      
        strandArrangement = [...strandArrangement, ...layerArrangement];
        // update the circumRad, circum cender + (inner) rad + (next layer) rad
        circumRad += rad + rad; // add the radius of the next layer
      }
    }

    return strandArrangement;
  }
}

class ConductorArrangementCore extends StrandedConductor{
  public strandArrangement: RadialCoordinate[] = [];

  constructor(
    N: number,
    rad: number,
    NCore: number,
    radCore: number,
    properties: ConductorProperties,
    coreProperties: ConductorProperties
  ) {
    super();
    const coreArrangement = new ConductorArrangement(NCore, radCore, coreProperties);

    if (!coreArrangement?.strandArrangement || coreArrangement.strandArrangement.length === 0) {
      this.strandArrangement = [];
    } else {
      this.strandArrangement = coreArrangement.strandArrangement;
    }

    // loop packing the layer until no strands left
    let circumRad = radCore + rad + 
      this.strandArrangement.reduce((max, coord) => Math.max(max, coord.r), 0);

    let strandsLeft = N
    for (let i = 0; strandsLeft > 0; i++) {
      const nextLayers = this.packLayer(circumRad, strandsLeft, rad);

      const PropLayers = nextLayers.map(coord => ({
        ...coord,
        properties: { ...properties } // inject properties
      }));

      this.strandArrangement = [...this.strandArrangement, ...PropLayers];
      circumRad += rad + rad; // add the radius of the next layer

      strandsLeft -= nextLayers.length;
      if (strandsLeft < 0 ) {
        throw new Error("Packed too many strands in the arrangement");
      }
    }
  }

  packLayer(circumRad: number, strandsLeft: number, rad: number): RadialCoordinate[] {
    return packLayer(circumRad, strandsLeft, rad);
  }

}

export { closePackedCore, ConductorArrangement, ConductorArrangementCore, RadialCoordinate };