
const ORBIT_DISTANCES = {
  EXTREMELY_CLOSE: {name:'Extremely Close'},
  VERY_CLOSE: {name:'Very Close'},
  CLOSE: {name:'Close'},
  MIDDLE: {name:'Middle'},
  FAR: {name:'Far'},
  VERY_FAR: {name:'Very Far'},
  EXTREMELY_FAR: {name:'Extremely Far'},
}
addAll(ORBIT_DISTANCES)

const SYSTEM_METALLICITIES = {
  EXTREMELY_HIGH: {name:'Extremely High'},
  VERY_HIGH: {name:'Very High'},
  HIGH: {name:'High'},
  MEDIUM: {name:'Medium'},
  LOW: {name:'Low'},
  VERY_LOW: {name:'Very Low'},
  EXTREMELY_LOW: {name:'Extremely Low'},
}
addAll(SYSTEM_METALLICITIES)

const SYSTEM_TYPES = {
  SOLITARY: {name:'Solitary', numStars:1, weight:1},
  BINARY: {name:'Binary', numStars:2, weight:1/3},
  TRINARY: {name:'Trinary', numStars:3, weight:1/27},
}
addAll(SYSTEM_TYPES)

const SYSTEM_AGES = {
  EXTREMELY_OLD: {name:'Extremely Old', weight:1/5},
  VERY_OLD: {name:'Very Old',weight:1/4},
  OLD: {name:'Old', weight:1/3},
  MEDIUM: {name:'Medium', weight:1/2},
  YOUNG: {name:'Young', weight:1},
  VERY_YOUNG: {name:'Very Young',weight:1/2},
  EXTREMELY_YOUNG: {name:'Extremely Young',weight:1/3},
}
addAll(SYSTEM_AGES)

function createSystemPopulation(name, weight, ageRange, metallicityRange) {
  return {name, weight, ageRange, metallicityRange}
}

const SYSTEM_POPULATIONS = {
  POPULATION_II: createSystemPopulation('Population II', 1/3, from(SYSTEM_AGES.OLD), to(SYSTEM_METALLICITIES.LOW)),
  POPULATION_I: createSystemPopulation('Population I', 1, to(SYSTEM_AGES.OLD), from(SYSTEM_METALLICITIES.LOW)),
}
addAll(SYSTEM_POPULATIONS)


const RADII = {
  EXTREMELY_LARGE: {name:'Extremely Large'},
  VERY_LARGE: {name:'Very Large'},
  LARGE: {name:'Large'},
  MEDIUM: {name:'Medium'},
  SMALL: {name:'Small'},
  VERY_SMALL: {name:'Very Small'},
  EXTREMELY_SMALL: {name:'Extremely Small'},
}
addAll(RADII)

const MASSES = {
  EXTREMELY_HEAVY: {name:'Extremely Heavy'},
  VERY_HEAVY: {name:'Very Heavy'},
  HEAVY: {name:'Heavy'},
  MEDIUM: {name:'Medium'},
  LIGHT: {name:'Light'},
  VERY_LIGHT: {name:'Very Light'},
  EXTREMELY_LIGHT: {name:'Extremely Light'},
}
addAll(MASSES)

const LUMINOSITIES = {
  EXTREMELY_BRIGHT: {name:'Extremely Bright'},
  VERY_BRIGHT: {name:'Very Bright'},
  BRIGHT: {name:'Bright'},
  MEDIUM: {name:'Medium'},
  DIM: {name:'Dim'},
  VERY_DIM: {name:'Very Dim'},
  EXTREMELY_DIM: {name:'Extremely Dim'},
  BLACK: {name:'Black'},
}
addAll(LUMINOSITIES)

const STAR_FEATURES = {
  SOLAR_FLARES: {name:'Solar Flares'},
  SUN_SPOTS: {name:'Sun-spots'},
}

function createStarType(name, weight, mass, luminosity, radius, ageRange) {
  return {name, weight, mass, luminosity, radius, ageRange}
}

const STAR_TYPES = { //MUST be arranged oldest and most massive to least
  //dead
  //SUPER_MASSIVE_BLACK_HOLE: createStarType('Super-Massive Black Hole', MASSES.EXTREMELY_HEAVY, LUMINOSITIES.BLACK, RADII.SMALL, from(SYSTEM_AGES.EXTREMELY_OLD)),
  //INTERMEDIATE_BLACK_HOLE: createStarType('Intermediate-Mass Black Hole', MASSES.VERY_HEAVY, LUMINOSITIES.BLACK, RADII.VERY_SMALL, from(SYSTEM_AGES.OLD)),

  //explode
  BLUE_HYPERGIANT: createStarType('Blue Hypergiant', 0.5/64, MASSES.EXTREMELY_HEAVY, LUMINOSITIES.EXTREMELY_BRIGHT, RADII.EXTREMELY_LARGE, [SYSTEM_AGES.EXTREMELY_YOUNG]),
  YELLOW_HYPERGIANT: createStarType('Yellow Hypergiant', 1/64, MASSES.EXTREMELY_HEAVY, LUMINOSITIES.VERY_BRIGHT, RADII.EXTREMELY_LARGE, [SYSTEM_AGES.EXTREMELY_YOUNG]),
  ORANGE_HYPERGIANT: createStarType('Orange Hypergiant', 2/64, MASSES.EXTREMELY_HEAVY, LUMINOSITIES.BRIGHT, RADII.EXTREMELY_LARGE, [SYSTEM_AGES.EXTREMELY_YOUNG]),
  RED_HYPERGIANT: createStarType('Red Supergiant', 4/64, MASSES.EXTREMELY_HEAVY, LUMINOSITIES.MEDIUM, RADII.EXTREMELY_LARGE, [SYSTEM_AGES.EXTREMELY_YOUNG]),
  //become black holes
  BLUE_SUPERGIANT: createStarType('Blue Supergiant', 0.5/16, MASSES.HEAVY, LUMINOSITIES.EXTREMELY_BRIGHT, RADII.VERY_LARGE, to(SYSTEM_AGES.VERY_YOUNG)),
  YELLOW_SUPERGIANT: createStarType('Yellow Supergiant', 1/16, MASSES.HEAVY, LUMINOSITIES.VERY_BRIGHT, RADII.VERY_LARGE, to(SYSTEM_AGES.VERY_YOUNG)),
  ORANGE_SUPERGIANT: createStarType('Orange Supergiant', 2/16, MASSES.HEAVY, LUMINOSITIES.BRIGHT, RADII.VERY_LARGE, to(SYSTEM_AGES.VERY_YOUNG)),
  RED_SUPERGIANT: createStarType('Red Supergiant', 4/16, MASSES.HEAVY, LUMINOSITIES.MEDIUM, RADII.VERY_LARGE, to(SYSTEM_AGES.VERY_YOUNG)),
  BLACK_HOLE: createStarType('Stellar Black Hole', 1/16, MASSES.HEAVY, LUMINOSITIES.BLACK, RADII.EXTREMELY_SMALL, from(SYSTEM_AGES.YOUNG)),
  //become neutron stars
  BLUE_GIANT: createStarType('Blue Giant', 0.5/4, MASSES.HEAVY, LUMINOSITIES.EXTREMELY_BRIGHT, RADII.LARGE, to(SYSTEM_AGES.YOUNG)),
  YELLOW_GIANT: createStarType('Yellow Giant', 1/4, MASSES.HEAVY, LUMINOSITIES.VERY_BRIGHT, RADII.LARGE, to(SYSTEM_AGES.YOUNG)),
  ORANGE_GIANT: createStarType('Orange Giant', 2/4, MASSES.HEAVY, LUMINOSITIES.BRIGHT, RADII.LARGE, to(SYSTEM_AGES.YOUNG)),
  NEUTRON_STAR: createStarType('Neutron Star', 1/4, MASSES.LIGHT, LUMINOSITIES.VERY_BRIGHT, RADII.EXTREMELY_SMALL, from(SYSTEM_AGES.OLD)),
  //become red giants -> white dwarves
  YELLOW_DWARF: createStarType('Yellow Dwarf', 1, MASSES.MEDIUM, LUMINOSITIES.DIM, LUMINOSITIES.BRIGHT, RADII.MEDIUM, to(SYSTEM_AGES.MEDIUM)),
  ORANGE_DWARF: createStarType('Orange Dwarf', 2, MASSES.MEDIUM, LUMINOSITIES.MEDIUM, RADII.MEDIUM, to(SYSTEM_AGES.MEDIUM)),
  RED_GIANT: createStarType('Red Giant', 1, MASSES.LIGHT, LUMINOSITIES.MEDIUM, RADII.LARGE, [SYSTEM_AGES.OLD]),
  WHITE_DWARF: createStarType('White Dwarf', 1, MASSES.EXTREMELY_LIGHT, LUMINOSITIES.DIM, RADII.EXTREMELY_SMALL, from(SYSTEM_AGES.OLD)),
  //straight to white dwarves
  RED_DWARF: createStarType('Red Dwarf', 4, MASSES.VERY_LIGHT, LUMINOSITIES.DIM, RADII.SMALL, to(SYSTEM_AGES.EXTREMELY_OLD)),
  //straight to black dwarves
  BROWN_DWARF: createStarType('Brown Dwarf', 1/4, MASSES.EXTREMELY_LIGHT, LUMINOSITIES.EXTREMELY_DIM, RADII.VERY_SMALL, to(SYSTEM_AGES.EXTREMELY_OLD)),
 
  PROTO_STAR: createStarType('Proto-star', 1, MASSES.EXTREMELY_LIGHT, LUMINOSITIES.EXTREMELY_DIM, RADII.VERY_SMALL, [SYSTEM_AGES.EXTREMELY_YOUNG]),
}
addAll(STAR_TYPES)

const PLANET_TYPES = {
  TERRESTRIAL: {name:'Terrestrial'},
  SUPER_EARTH: {name:'Super-Earth'},
  GAS_GIANT: {name:'Gas Giant'},
  ICE_GIANT: {name:'Ice Giant'},
  GAS_DWARF: {name:'Gas Dwarf'},
  ICE_DWARF: {name:'Ice Dwarf'},
}
addAll(PLANET_TYPES)

const PLANET_COMPOSITIONS = {
  SILICATE: {name:'Silicate'},
  CARBON: {name:'Carbon'},
  IRON: {name:'Iron'},
  HYDROGEN: {name:'Hydrogen'},
  HELIUM: {name:'Helium'},
  WATER: {name:'Water'},
  METHANE: {name:'Methane'},
  AMMONIA: {name:'Ammonia'},
}
addAll(PLANET_COMPOSITIONS)