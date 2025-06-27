import { gmr } from "../../calculators/gmr";
import  { ConductorProperties, RadialCoordinate, RadialConductor } from "../../data/conductorInterface";

import { packStrandedConductorWithCore, packStrandedConductor } from "../../calculators/conductorPacking.ts";

type ConductorPropertyWeights = ConductorProperties & {
  weight_percent: number; 
  surface_area: number; // Optional surface area for weighted properties
} 

/**
 * All Conductors, starting with a solid wire
 * 
 */
interface Conductor {
  radius: number; // Radius in meters
  // properties: ConductorProperties; // Properties of the conductor (e.g., "copper", "aluminum")

  /* static properties */

  // bundles can have multiple material types, could be array

  circumscribedRadius(): number; // Circumscribed radius in meters
  surfaceArea(): number; // Surface area in m^2,for considering insulation
  conductiveSurfaceArea(): number; // Conductive surface area in m^2

  weightedProperties(): ConductorPropertyWeights[]; // Weighted properties of the conductor

  conductorProperties(): ConductorProperties; // Properties of the conductor (e.g., "copper", "aluminum")
  coreProperties(): ConductorProperties | null; // Properties of the core conductor, if applicable

  effectivePermeability(): number; // Effective permeability of the conductor
  resistanceFn(): (temperature: number) => number; // Function to calculate resistance/length(m) from temperature
  gmr(): number; // Geometric Mean Radius in meters
}

class SolidConductor implements Conductor {
  name: string;
  radius: number; // Radius in meters
  properties: ConductorProperties; 

  constructor(name: string, radius: number, properties: ConductorProperties ) {
    this.name = name;
    this.radius = radius;
    this.properties = properties;
  }

  circumscribedRadius(): number {
    return this.radius; // For a solid conductor, the circumscribed radius is the same as the radius
  }

  surfaceArea(): number {
    return this.conductiveSurfaceArea(); // Surface area is the same as conductive surface area for a solid conductor
  }

  conductiveSurfaceArea(): number {
    return  Math.PI * this.radius * this.radius; // Surface area of a cylinder (2 * π * r)
  }

  weightedProperties(): ConductorPropertyWeights[] {
    return [{ ...this.properties, weight_percent: 100, surface_area: this.surfaceArea() }]; // Solid conductor has 100% of its own properties
  }

  conductorProperties(): ConductorProperties {
    return this.weightedProperties()[0]; // Solid conductor has its own properties
  }

  coreProperties(): null {
    // Solid conductors do not have a core, so return the same properties
    return null;
  }

  effectivePermeability(): number {
    // For a solid conductor, effective permeability is the same as the material's permeability
    return this.properties.permeability_relative;
  }

  resistanceFn(): (temperature: number) => number {
    // returns a function that calculates resistance/length based on temperature
    const { resistivity, temp_reference, temp_coef_of_resistivity } = this.properties;
    const surfaceArea = this.conductiveSurfaceArea();

    return (temperature: number) => {
      const temp_diff = temperature - temp_reference;
      return resistivity / surfaceArea * (1 + (temp_coef_of_resistivity * temp_diff));
    };
  }

  gmr(): number {
    return gmr(this.radius); // Geometric Mean Radius for a solid conductor
  }
}

class ConductorStrandIndividual implements Conductor {
  r: number; // radius from center
  theta: number; // angle in radians
  radius: number; // radius of the strand, mm
  properties: ConductorProperties; // Properties of the conductor strand

  constructor(r: number, theta: number, radius: number, properties: ConductorProperties) {
    this.r = r;
    this.theta = theta;
    this.radius = radius;
    this.properties = properties;
  }
  
  circumscribedRadius(): number {
    return this.r + this.radius; // Circumscribed radius is the distance from the center
  }

  surfaceArea(): number {
    return this.conductiveSurfaceArea();
  }

  conductiveSurfaceArea(): number {
    return Math.PI * this.radius * this.radius; // Surface area of the strand
  }

  weightedProperties(): ConductorPropertyWeights[] {
    return [{ ...this.properties, weight_percent: 100, surface_area: this.surfaceArea() }]; // Each strand has its own properties
  }

  conductorProperties(): ConductorProperties {
    return this.weightedProperties()[0]; // Solid conductor has its own properties
  }

  coreProperties(): null {
    // Solid conductors do not have a core, so return the same properties
    return null;
  }

  effectivePermeability(): number {
    return this.properties.permeability_relative;
  }

  resistanceFn(): (temperature: number) => number {
    // returns a function that calculates resistance/length based on temperature
    const { resistivity, temp_reference, temp_coef_of_resistivity } = this.properties;
    const surfaceArea = this.conductiveSurfaceArea(); // Convert mm^2 to  m^2for consistency with resistivity in ohm-m^2/m

    return (temperature: number) => {
      const temp_diff = temperature - temp_reference;
      return resistivity / surfaceArea * (1 + (temp_coef_of_resistivity * temp_diff));
    };
  }

  gmr(): number {
    return gmr(this.radius); // Geometric Mean Radius for a strand
  }
}


/**
 * A bundle of conductors, 
 * 
 * 
 */
class StrandedConductor implements Conductor {
  name: string;
  arrangement: ConductorStrandIndividual[];
  radius: number;

  
  constructor(name: string, strands: number, strandRadius: number, strandProperties: ConductorProperties, 
    coreStrands?: number, coreRadius?: number, coreProperties?: ConductorProperties,
    outerRadius?: number
  ) {
      this.name = name;

      if (coreStrands && coreRadius && coreProperties) {
        const theseStrands: RadialConductor[] = packStrandedConductorWithCore(strands, strandRadius, coreStrands, coreRadius, strandProperties, coreProperties);
        this.arrangement = theseStrands.map(s => new ConductorStrandIndividual(s.r, s.theta, s.radius, s.properties));
      } else {
        const theseStrands: RadialConductor[] = packStrandedConductor(strands, strandRadius, strandProperties);
        this.arrangement = theseStrands.map(s => new ConductorStrandIndividual(s.r, s.theta, s.radius, s.properties));
      }

      this.radius = outerRadius || Math.max(...this.arrangement.map(c => c.r + c.radius));
  }

  circumscribedRadius(): number {
    // Calculate the circumscribed radius based on the radial conductors
    return Math.max(...this.arrangement.map(c => c.r + c.radius));
  }

  surfaceArea(): number {
    // Calculate the total surface area of all conductors in the arrangement
    return this.conductiveSurfaceArea()
  }

  conductiveSurfaceArea(): number {
    return this.arrangement.reduce((total, c) => {
        // Check if the conductor has a conductivity property
        if (c.properties?.conductivity > 1) {
            // Calculate the surface area of each conductor and add it to the total
            return total + c.conductiveSurfaceArea();
        }
        // If no conductivity, return the total unchanged
        return total;
    }, 0)
  }

  weightedProperties(): ConductorPropertyWeights[] {
    // for each this.arrangement, get the properties and the surface area
    // I should sum the total surface area of all conductors
    // then calculate the weighted percentage of each conductor's surface area

    const propMap: { [key: string]: number } = {};

    this.arrangement.forEach(c => {
      const prop = c.properties;
      if (propMap[prop.type]) {
        propMap[prop.type] += c.conductiveSurfaceArea();
      } else {
        propMap[prop.type] = c.conductiveSurfaceArea();
      }
    });

    const totalSurfaceArea = propMap ? Object.values(propMap).reduce((sum, area) => sum + area, 0) : 0;
    if (totalSurfaceArea === 0) {
      return []; // Avoid division by zero
    }

    const condWeights = Object.entries(propMap).map(([type, surfaceArea]) => {
      // Find a strand with this type to get its properties
      const strand = this.arrangement.find(c => c.properties.type === type);
      if (!strand) throw new Error(`No strand found for type ${type}`);
      const props = strand.properties;

      return  {
        ...props,
        weight_percent: (surfaceArea / totalSurfaceArea) * 100,
        surface_area: surfaceArea
      };
    });

    return condWeights;
  }

  conductorProperties(): ConductorProperties {
    // highest weighted property
    const weightedProps = this.weightedProperties();
    if (weightedProps.length === 0) {
      throw new Error("No weighted properties available for conductor properties.");
    } else if (weightedProps.length > 2) {
      // If there are multiple properties, we can log them for debugging
      console.warn("More than 2 weighted properties found, returning the highest weighted property.");
    }
    
    // find the highest weighted  conductor property
    return weightedProps.reduce((highest, current) => {
      return (current.weight_percent > highest.weight_percent) ? current : highest;
    }
    , weightedProps[0]);
  }

  coreProperties(): ConductorProperties {
    // Solid conductors do not have a core, so return the same properties
    const weightedProps = this.weightedProperties();

    if (weightedProps.length === 0) {
      throw new Error("No weighted properties available for core properties.");
    } else if (weightedProps.length > 2) {
      // If there are multiple properties, we can log them for debugging
      console.warn("More than 2 properties found, returning the lowest weighted property.");
    }

    // find the lowest weighted conductor property
    return weightedProps.reduce((lowest, current) => {
      return (current.weight_percent < lowest.weight_percent) ? current : lowest;
    }
    , weightedProps[0]);
  }


  effectivePermeability(): number {
    // Calculate the effective permeability based on the arrangement
    const weightedProps = this.weightedProperties();
    if (weightedProps.length === 0) {
      throw new Error("No weighted properties available for effective permeability calculation.");
    }

    // calculate and return the weighted average permeability
    return weightedProps.reduce((total, prop) => {
      return total + (prop.permeability_relative * (prop.weight_percent / 100));
    }
    , 0);
  }

  resistanceFn(): (temperature: number) => number {
    // returns a function that calculates resistance/length based on temperature

    // get weightedProperties
    const weightedProps = this.weightedProperties();
    if (weightedProps.length === 0) {
      throw new Error("No weighted properties available for resistance calculation.");
    }

    const resList: number[] = []

    return (temperature: number): number => {
      let totalResistancePerLength = 0;

      weightedProps.forEach(({ resistivity, temp_coef_of_resistivity, surface_area }) => {
        // Adjust resistivity based on temperature
        const adjustedResistivity = resistivity * (1 + (temp_coef_of_resistivity * (temperature - 20))); // Assuming 20°C reference

        // Multiply adjusted resistivity by total surface area
        totalResistancePerLength += adjustedResistivity / surface_area; // Convert mm^2 to m^2 for consistency with resistivity in ohm-m^2/m
        resList.push(adjustedResistivity / surface_area);
      });

      // Return the total resistanceEq per length, note: Parallel
      const invResEq = resList.reduce((total, res) => total + (1/res), 0);
      const resEq = 1 / invResEq;

      return resEq;
    };
  }


  private calculateDistance(coord1: RadialCoordinate, coord2: RadialCoordinate): number {
    // Convert polar coordinates to Cartesian coordinates
    const x1 = coord1.r * Math.cos(coord1.theta);
    const y1 = coord1.r * Math.sin(coord1.theta);
    const x2 = coord2.r * Math.cos(coord2.theta);
    const y2 = coord2.r * Math.sin(coord2.theta);

    // Calculate Euclidean distance
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  private generateDistanceMatrix(): number[][] {
    const distanceMatrix: number[][] = [];

    for (let i = 0; i < this.arrangement.length; i++) {
      const row: number[] = [];
      for (let j = 0; j < this.arrangement.length; j++) {
        if (i === j) {
          const radius = this.arrangement[i].radius;
          row.push(radius * Math.exp(-0.25)); // Distance to itself is it's radius
        } else {
          const distance = this.calculateDistance(this.arrangement[i], this.arrangement[j]);
          row.push(distance);
        }
      }
      distanceMatrix.push(row);
    }

    return distanceMatrix;
  }

  gmr(): number {
    const conductorGMR = gmr(this.generateDistanceMatrix());

    // if (this.insulThickness !== undefined && this.insulType !== undefined) {
    //   const totalRad = this.circumscribeRadius() + this.insulThickness;
    //   const gmrInsul = conductorGMR * ( 1 + (this.insulThickness / totalRad))

    //   return gmrInsul;
    // }

    return conductorGMR
  }
}

export { SolidConductor, StrandedConductor };
