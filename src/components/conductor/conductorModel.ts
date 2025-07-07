import { gmr } from "../../calculators/gmr";
import  { ConductorProperties, RadialCoordinate, RadialConductor } from "../../data/conductorInterface";

import { packStrandedConductorWithCore, packStrandedConductor } from "../../calculators/conductorPacking.ts";
 
import { calculateSkinDepth } from "../../calculators/skinEffect";
import { permeability_of_free_space, permittivity_or_free_space } from "../../calculators/constants";

type ConductorPropertyWeights = ConductorProperties & {
  weight_percent: number; 
  surface_area: number; // Optional surface area for weighted properties
} 

type ConductorType = string; // Extend with more types as needed

/**
 * All Conductors, starting with a solid wire
 * 
 */
interface Conductor {
  radius: number; // Radius in meters
  weightedProperties: ConductorPropertyWeights[];
  conductorProperties: ConductorProperties;
  coreProperties: ConductorProperties | null;
  compositeCore: ConductorType | null; // Whether the conductor has a composite core

  // properties: computeConductorProperties; // Properties of the conductor (e.g., "copper", "aluminum")

  /* static properties */

  // bundles can have multiple material types, could be array

  circumscribedRadius(): number; // Circumscribed radius in meters
  surfaceArea(): number; // Surface area in m^2,for considering insulation
  conductiveSurfaceArea(frequency: number): number; // Conductive surface area in m^2

  computeWeightedProperties(): ConductorPropertyWeights[]; // Weighted properties of the conductor

  computeConductorProperties(): ConductorProperties; // Properties of the conductor (e.g., "copper", "aluminum")
  computeCoreProperties(): ConductorProperties | null; // Properties of the core conductor, if applicable

  resistanceFn(): (temperature: number, frequency: number) => number; // Function to calculate resistance/length(m) from temperature
  inductanceFn(): (gmd_m: number) => number; // Inductance per length in H/m, if applicable
  capacitanceFn(): (gmd_m: number) => number; // Capacitance per length in F/m, if applicable

  gmr(): number; // Geometric Mean Radius in meters
}

class SolidConductor implements Conductor {
  name: string;
  radius: number; // Radius in meters
  properties: ConductorProperties;
  
  weightedProperties: ConductorPropertyWeights[];
  conductorProperties: ConductorProperties;
  coreProperties: null;
  compositeCore: null;

  constructor(name: string, radius: number, properties: ConductorProperties ) {
    this.name = name;
    this.radius = radius;
    this.properties = properties;

    this.weightedProperties = this.computeWeightedProperties();
    this.conductorProperties = this.computeConductorProperties();
    this.coreProperties = this.computeCoreProperties();
  }

  circumscribedRadius(): number {
    return this.radius; // For a solid conductor, the circumscribed radius is the same as the radius
  }

  surfaceArea(): number {
    return (Math.PI * this.radius * this.radius); // Surface area is the same as conductive surface area for a solid conductor
  }

  conductiveSurfaceArea(frequency: number = 0): number {
    if (frequency <= 0) {
      return this.surfaceArea(); // If frequency is not provided, return the surface area
    }
    const { resistivity, permeability_relative } = this.properties
    const skinDepth = calculateSkinDepth(frequency, resistivity, permeability_relative);

    // if skindepth is greater than radius, then the entire surface area is conductive
    if (skinDepth >= this.radius) {
      return this.surfaceArea();
    }

    const nonConductiveArea = Math.PI * (this.radius - skinDepth)*(this.radius - skinDepth);
    return  (Math.PI * this.radius * this.radius) - nonConductiveArea;
  }


  computeWeightedProperties(): ConductorPropertyWeights[] {
    return [{ ...this.properties, weight_percent: 100, surface_area: this.surfaceArea() }]; // Solid conductor has 100% of its own properties
  }

  computeConductorProperties(): ConductorProperties {
    return this.weightedProperties[0]; // Solid conductor has its own properties
  }

  computeCoreProperties(): null {
    // Solid conductors do not have a core, so return the same properties
    return null;
  }

  resistanceFn(): (temperature: number, frequency: number) => number {
    // returns a function that calculates resistance/length based on temperature
    const { resistivity, temp_reference, temp_coef_of_resistivity } = this.properties;

    return (temperature: number, frequency: number = 0) => {
      const condSurfaceArea = this.conductiveSurfaceArea(frequency);
      const tempResFactor = (temp_coef_of_resistivity * (temperature - temp_reference));

      return resistivity / condSurfaceArea * (1 + tempResFactor);
    };
  }

  inductanceFn(): (gmd_m: number) => number {
    // returns a function that calculates inductance per length based on frequency
    const { permeability_relative } = this.properties;

    return (gmd_m: number) => {
      const mu = permeability_of_free_space * permeability_relative;
      return (mu / (2 * Math.PI)) * Math.log(gmd_m / this.gmr());
    };
  }

  capacitanceFn(): (gmd_m: number) => number {
    // returns a function that calculates capacitance per length based on frequency
    const permittivity_relative = 1;

    return (gmd_m: number) => {
      const epsilon = permittivity_or_free_space * permittivity_relative;
      return (2 * Math.PI * epsilon) / Math.log(gmd_m / this.gmr());
    };
  }

  gmr(): number {
    return gmr(this.radius); // (meter) Geometric Mean Radius for a solid conductor
  }
}

class ConductorStrandIndividual implements Conductor {
  r: number; // radius from center
  theta: number; // angle in radians
  radius: number; // radius of the strand, mm
  properties: ConductorProperties; // Properties of the conductor strand

  weightedProperties: ConductorPropertyWeights[];
  conductorProperties: ConductorProperties;
  coreProperties: null; // Solid conductors do not have a core, so this is
  compositeCore: null;
  

  constructor(r: number, theta: number, radius: number, properties: ConductorProperties) {
    this.r = r;
    this.theta = theta;
    this.radius = radius;
    this.properties = properties;

    this.weightedProperties = this.computeWeightedProperties();
    this.conductorProperties = this.computeConductorProperties();
    this.coreProperties = this.computeCoreProperties();
  }
  
  circumscribedRadius(): number {
    return this.r + this.radius; // Circumscribed radius is the distance from the center
  }

  surfaceArea(): number {
    return (Math.PI * this.radius * this.radius);
  }

  conductiveSurfaceArea(frequency: number = 0): number {
    if (frequency <= 0) {
      return this.surfaceArea(); // If frequency is not provided, return the surface area
    }
    const { resistivity, permeability_relative } = this.properties
    const skinDepth = calculateSkinDepth(frequency, resistivity, permeability_relative);

    // if skindepth is greater than radius, then the entire surface area is conductive
    if (skinDepth >= this.radius) {
      return this.surfaceArea();
    } else {
      const nonConductiveArea = Math.PI * (this.radius - skinDepth)*(this.radius - skinDepth);
      return  (Math.PI * this.radius * this.radius) - nonConductiveArea;
    }

  }

  computeWeightedProperties(): ConductorPropertyWeights[] {
    return [{ ...this.properties, weight_percent: 100, surface_area: this.surfaceArea() }]; // Each strand has its own properties
  }

  computeConductorProperties(): ConductorProperties {
    return this.weightedProperties[0]; // Solid conductor has its own properties
  }

  computeCoreProperties(): null {
    // Solid conductors do not have a core, so return the same properties
    return null;
  }

  resistanceFn(): (temperature: number, frequency: number) => number {
    // returns a function that calculates resistance/length based on temperature
    const { resistivity, temp_reference, temp_coef_of_resistivity } = this.properties;

    return (temperature: number, frequency: number = 0) => {
      const condSurfaceArea = this.conductiveSurfaceArea(frequency); // Convert mm^2 to  m^2for consistency with resistivity in ohm-m^2/m

      const temp_diff = temperature - temp_reference;
      return resistivity / condSurfaceArea * (1 + (temp_coef_of_resistivity * temp_diff));
    };
  }

  inductanceFn(): (gmd_m: number) => number {
    // returns a function that calculates inductance per length based on frequency
    const { permeability_relative } = this.properties;

    return (gmd_m: number) => {
      const mu = permeability_of_free_space * permeability_relative;
      return (mu / (2 * Math.PI)) * Math.log(gmd_m / this.gmr());
    };
  }

  capacitanceFn(): (gmd_m: number) => number {
    
    // returns a function that calculates capacitance per length based on frequency
    const permittivity_relative = 1;

    return (gmd_m: number) => {
      const epsilon = permittivity_or_free_space * permittivity_relative;
      return (2 * Math.PI * epsilon) / Math.log(gmd_m / this.gmr());
    };
  }

  gmr(): number {
    return gmr(this.radius); // Geometric Mean Radius for a strand
  }
}

/**
 * A bundle of conductors, each with its own properties and arrangement.
 */
class StrandedConductor implements Conductor {
  name: string;
  arrangement: ConductorStrandIndividual[];
  radius: number;
  compositeCore: ConductorType | null; // Whether the conductor has a composite core

  weightedProperties: ConductorPropertyWeights[];
  conductorProperties: ConductorProperties;
  coreProperties: ConductorProperties | null;
  
  constructor(name: string, strands: number, strandRadius: number, strandProperties: ConductorProperties, 
    coreStrands?: number, coreRadius?: number, coreProperties?: ConductorProperties,
    outerRadius?: number
  ) {
      this.name = name;

      let strandsTot = coreStrands ? strands + coreStrands : strands;
      if (strandsTot <= 0) {
        throw new Error("No valid strands provided for a stranded conductor.");
      } else if (strandRadius <= 0) {
        throw new Error("Strand radius must be greater than 0.");
      } 

      if (coreStrands && coreRadius && coreProperties) {
        this.compositeCore = coreProperties.type || null; // Use the type of the core properties, or null if not defined
        const theseStrands: RadialConductor[] = packStrandedConductorWithCore(strands, strandRadius, coreStrands, coreRadius, strandProperties, coreProperties);
        this.arrangement = theseStrands.map(s => new ConductorStrandIndividual(s.r, s.theta, s.radius, s.properties));
      } else {
        this.compositeCore = null
        const theseStrands: RadialConductor[] = packStrandedConductor(strands, strandRadius, strandProperties);
        this.arrangement = theseStrands.map(s => new ConductorStrandIndividual(s.r, s.theta, s.radius, s.properties));
      }

      this.radius = outerRadius || Math.max(...this.arrangement.map(c => c.r + c.radius));

      this.weightedProperties = this.computeWeightedProperties();
      this.conductorProperties = this.computeConductorProperties();
      this.coreProperties = this.computeCoreProperties();
  }

  circumscribedRadius(): number {
    // Calculate the circumscribed radius based on the radial conductors
    return Math.max(...this.arrangement.map(c => c.r + c.radius));
  }

  surfaceArea(): number {
    // Calculate the total surface area of all conductors in the arrangement

    return this.arrangement.reduce((total, c) => {
      return total + c.surfaceArea();
    }, 0);
  }

  conductiveSurfaceArea(frequency: number): number {
    // each conductor type has a different permeability and resistivity, so we need to calculate the conductive surface area for each conductor
    console.log("Conductive Surface Area for ConductorStrandIndividual", frequency);
    return this.arrangement.reduce((total, c) => {
      return total + c.conductiveSurfaceArea(frequency);
    }, 0)
  }

  computeWeightedProperties(): ConductorPropertyWeights[] {
    // for each this.arrangement, get the properties and the surface area
    // I should sum the total surface area of all conductors
    // then calculate the weighted percentage of each conductor's surface area

    const propMap: { [key: string]: number } = {};

    this.arrangement.forEach(c => {
      const prop = c.properties;
      if (propMap[prop.type]) {
        propMap[prop.type] += c.surfaceArea();
      } else {
        propMap[prop.type] = c.surfaceArea();
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

  computeConductorProperties(): ConductorProperties {
    // highest weighted property
    const weightedProps = this.weightedProperties;
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

  computeCoreProperties(): ConductorProperties | null {
    // Solid conductors do not have a core, so return the same properties
    if (!this.compositeCore) {
      return null;
    }

    const weightedProps = this.weightedProperties;

    if (weightedProps.length === 0) {
      throw new Error("No weighted properties available for core properties.");
    } else if (weightedProps.length === 1) {
      // If there is only one property, return it directly
      return weightedProps[0];
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

  resistanceFn(): (temperature: number, frequency: number) => number {
    // returns a function that calculates resistance/length based on temperature

    // get computeWeightedProperties
    const weightedProps = this.weightedProperties;
    if (weightedProps.length === 0) {
      throw new Error("No weighted properties available for resistance calculation.");
    }

    return (temperature: number, frequency: number): number => {
      const resList: number[] = []

      if (frequency <= 0) {
        weightedProps.forEach(({ temp_reference, resistivity, temp_coef_of_resistivity, surface_area }) => {
        // Adjust resistivity based on temperature
        const adjustedResistivity = resistivity / surface_area * (1 + (temp_coef_of_resistivity * (temperature - temp_reference)));

        resList.push(adjustedResistivity);
      });
      } else {
        // we rigorously calculate the conductive surface area for each strand

        this.arrangement.forEach(c => {
          const condSurfaceArea = c.conductiveSurfaceArea(frequency);
          const { temp_reference, resistivity, temp_coef_of_resistivity } = c.properties;

          // Adjust resistivity based on temperature
          const adjustedResistivity = resistivity / condSurfaceArea * (1 + (temp_coef_of_resistivity * (temperature - temp_reference)));

          resList.push(adjustedResistivity);
        });
      }
      // Return the total resistanceEq per length, note: Parallel
      const invResEq = resList.reduce((total, res) => total + (1/res), 0);
      const resEq = 1 / invResEq;

      return resEq;
    };
  }

  inductanceFn(): (gmd_m: number) => number {
    // returns a function that calculates inductance per length
    const { permeability_relative } = this.conductorProperties;

    return (gmd_m: number) => {
      const mu = permeability_of_free_space * permeability_relative;
      return (mu / (2 * Math.PI)) * Math.log(gmd_m / this.gmr());
    };
  }

  capacitanceFn(): (gmd_m: number) => number {
    // returns a function that calculates capacitance per length
    const permittivity_relative = 1;

    return (gmd_m: number) => {
      const epsilon = permittivity_or_free_space * permittivity_relative;
      return (2 * Math.PI * epsilon) / Math.log(gmd_m / this.gmr());
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
