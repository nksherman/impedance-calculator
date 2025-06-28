import  {  ConductorProperties, RadialConductor } from "../data/conductorInterface.ts";

// predefined patterns for packing conductors in a radial arrangement
const patternsTotal = {
  1: [1, 7, 19, 37, 61, 91, 127, 169],
  2: [3, 12, 27, 48, 75, 108, 147, 192],
  3: [4, 14, 30, 52, 80, 114, 154, 200],
  // 4: {Any incomplete layer, user input},
  // 5: {Center strand different size},
}

function getLayers(N: number): number[] {
  if (N in patternsTotal[1]) {
    // get the index in patternsTotal[1]
    const index = patternsTotal[1].findIndex(value => value === N);
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

function packLayer(circumCore: number, strands: number, rad: number, properties: ConductorProperties): RadialConductor[] {    
  // for the circumference radius, pack X circles of radius rad around it
  // parent will count and dedent strandsLeft
  const layerArrangement: RadialConductor[] = [];

  let circumRad = circumCore;
  let strandsLeft = strands;

  if (circumRad === 0 && strandsLeft > 0) {
    // layer just core, centered strand
    layerArrangement.push({ r: 0, theta: 0, radius: rad, properties });
    strandsLeft -= 1; // one strand packed at the center
    circumRad = rad + rad; // set to radius of the strand
  }

  // 

  while (strandsLeft > 0) {
    // pack into the next layer
    const circum = Math.PI*circumRad*2;
    let thisPack = Math.floor(circum / (rad * 2));

    if (thisPack <= 0) {
      throw new Error("Cannot pack any strands in this layer");
    } else if (thisPack > strandsLeft) {
      thisPack = strandsLeft; // pack remaining
    }
    strandsLeft -= thisPack;
    const angleIncrement = (2 * Math.PI) / thisPack;
    for (let i = 0; i < thisPack; i++) {
      const theta = i * angleIncrement;
      layerArrangement.push({ r: circumRad, theta, radius: rad, properties  });
    }

    circumRad = circumRad + rad + rad; // increase radius for next layer
  }

  return layerArrangement;
}

function closePackedCore(strands: number, radius: number, properties: ConductorProperties): RadialConductor[] {
  const arrangement: RadialConductor[] = [];

  let circumRad = 0;

  let strandsLeft = strands;

  if (strands === 0) {
    return arrangement; // no strands to pack
  } else if ( strandsLeft === 2 ) {
    // side by side
    circumRad = radius + radius;
    arrangement.push({ r: 0, theta: 0, radius, properties });
    arrangement.push({ r: radius, theta: 0, radius, properties });
  } else if ( strandsLeft === 3) {
    const rad = radius * Math.sqrt(3);
    circumRad = rad + radius;
    arrangement.push({ r: rad, theta: (2 * Math.PI) / 3, radius, properties });
    arrangement.push({ r: rad, theta: 0, radius, properties });
    arrangement.push({ r: rad, theta: 2*(2 * Math.PI) / 3, radius, properties });
  } else if (strandsLeft === 4 ) {
    const rad = radius * Math.sqrt(8);
    circumRad = rad + radius;
    arrangement.push({ r: rad, theta: 0, radius, properties });
    arrangement.push({ r: rad, theta: Math.PI / 2, radius, properties });
    arrangement.push({ r: rad, theta: Math.PI, radius, properties });
    arrangement.push({ r: rad, theta: (3 * Math.PI) / 2, radius, properties });
  }

  strandsLeft -= arrangement.length; // deduct packed strands
  
  if (strandsLeft <= 0) {
    return arrangement; // no more strands to pack
  }
  // else packLayer(s) till complete
  arrangement.push(...packLayer(circumRad, strandsLeft, radius, properties));

  return arrangement;
}

function packStrandedConductorWithCore(
  strands: number,
  radius: number,
  coreStrands: number,
  coreRadius: number,
  properties: ConductorProperties,
  coreProperties: ConductorProperties
): RadialConductor[] {
  if (strands <= 0) {
    return [];
  }

  let circumRadius = 0;
  const arrangement: RadialConductor[] = [];

  if (coreStrands > 0 && coreRadius > 0) {
    const coreArrangement = closePackedCore(coreStrands, coreRadius, coreProperties);
    // apply properties to core strands

    circumRadius = radius + Math.max(...coreArrangement.map(s => s.r + s.radius));
    arrangement.push(...coreArrangement);
  }

  arrangement.push(...packLayer(circumRadius, strands, radius, properties))

  return arrangement;
}

function packStrandedConductor(
  strands: number,
  radius: number,
  properties: ConductorProperties
): RadialConductor[] {
  if (strands <= 0) {
    return [];
  }

  let circumRadius = 0;
  let strandsLeft = strands;
  const arrangement: RadialConductor[] = [];

  // Catch typical cases for close packed cores
  const patternStrands = getLayers(strands);
  if (patternStrands.length > 0) {
    // close pack the first layer
    const coreArrangement = closePackedCore(patternStrands[0], radius, properties);
    circumRadius = radius + Math.max(...coreArrangement.map(s => s.r + s.radius));

    const corePropertiesApplied = properties || undefined;
    const coreArrangementWithProperties = coreArrangement.map((strand) => ({
      ...strand,
      properties: corePropertiesApplied,
    })) as RadialConductor[];

    strandsLeft -= patternStrands[0];
    arrangement.push(...coreArrangementWithProperties);
  }

  // Pack the remaining strands
  const layerArrangement = packLayer(circumRadius, strandsLeft, radius, properties);
  arrangement.push(...layerArrangement);

  return arrangement;
}

export { packLayer, packStrandedConductorWithCore, packStrandedConductor }