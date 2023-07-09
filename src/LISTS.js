const MATTER_STATES = {
  //GRAVITIC_SOLID: {name:'Gravitic Solid', solid:true}, //would normally sublimate, but gravity compresses it
  //GRAVITIC_LIQUID: {name:'Gravitic Liquid', liquid:true}, //would normally boil, but gravity compresses it
  //GRAVITIC_MAGMA: {name:'Gravitic Magma', liquid:true}, //would normally boil, but gravity compresses it
  COMPRESSED_SOLID: {name:'Compressed Solid', solid:true}, //TOP LEFT: temp below triple, pressure above critical 
  COMPRESSED_LIQUID: {name:'Compressed Liquid', liquid:true}, //TOP MIDDLE: pressure above critical, temp in-between
  SUPER_CRITICAL_FLUID: {name:'Super-Critical Fluid', liquid:true}, //TOP RIGHT: pressure and temp above critical
  SOLID: {name:'Solid', solid:true}, //MID LEFT: temp below triple, pressure in-between
  LIQUID: {name:'Liquid', liquid:true}, //CENTER TL: pressure and temp in-between, ratio > slope
  VAPOR: {name:'Vapor', gas:true}, //CENTER BR: pressure and temp in-between, ratio < slope
  PRESSURIZED_GAS: {name:'Pressurized Gas', gas:true}, //MID RIGHT: temperature above critical, pressure in-between
  SUPER_COOLED_LIQUID: {name:'Super-Cooled Liquid', liquid:true}, //BOTTOM LEFT (GRADIENT): to avoid having a triple point
  FROZEN_SOLID: {name:'Frozen Solid', solid:true}, //BOTTOM LEFT TL: pressure and temp below triple, ratio > slope
  SUBLIME_GAS: {name:'Sublime Gas', gas:true}, //BOTTOM LEFT BR: pressure and temp below triple, ratio < slope
  GAS: {name:'Gas', gas:true}, //BOTTOM CENTER: pressure below triple, temp in-between
  RAREFIED_LIQUID: {name:'Rarefied Liquid', liquid:true}, //BOTTOM CENTER (GRADIENT): to avoid having a triple point
  HOT_GAS: {name:'Hot Gas', gas:true}, //BOTTOM RIGHT: pressure below triple, heat above critical
}
listUtil.addAll(MATTER_STATES)
MATTER_STATES.LIQUIDS = MATTER_STATES.ALL.filter(m=>m.liquid)
MATTER_STATES.SOLIDS = MATTER_STATES.ALL.filter(m=>m.solid)
MATTER_STATES.GASSES = MATTER_STATES.ALL.filter(m=>m.gas)

const PLANET_TIME_PERIODS = {
  WINTER_NIGHT: {name:'Winter Night', night:true, winter:true},
  WINTER_DAY: {name:'Winter Day', day:true, winter:true},
  SUMMER_NIGHT: {name:'Summer Night', night:true, summer:true},
  SUMMER_DAY: {name:'Summer Day', day:true, summer:true},
}
listUtil.addAll(PLANET_TIME_PERIODS)

const PLANET_TIME_PERIOD_GROUPS = {
  WINTER_DAY_SUMMER_NIGHT: {name:'Winter Day + Summer Night', periods:[PLANET_TIME_PERIODS.WINTER_DAY, PLANET_TIME_PERIODS.SUMMER_NIGHT]},

  WINTER_NIGHT: {name:'Winter Night', periods:[PLANET_TIME_PERIODS.WINTER_NIGHT]},
  WINTER_DAY: {name:'Winter Day', periods:[PLANET_TIME_PERIODS.WINTER_DAY]},
  SUMMER_NIGHT: {name:'Summer Night', periods:[PLANET_TIME_PERIODS.SUMMER_NIGHT]},
  SUMMER_DAY: {name:'Summer Day', periods:[PLANET_TIME_PERIODS.SUMMER_DAY]},
  WINTER: {name:'Winter', periods:[PLANET_TIME_PERIODS.WINTER_DAY, PLANET_TIME_PERIODS.WINTER_NIGHT]},
  SUMMER: {name:'Summer', periods:[PLANET_TIME_PERIODS.SUMMER_DAY, PLANET_TIME_PERIODS.SUMMER_NIGHT]},
  NIGHT: {name:'Night', periods:[PLANET_TIME_PERIODS.WINTER_NIGHT, PLANET_TIME_PERIODS.SUMMER_NIGHT]},
  DAY: {name:'Day', periods:[PLANET_TIME_PERIODS.WINTER_DAY, PLANET_TIME_PERIODS.SUMMER_DAY]},
  EXCEPT_WINTER_NIGHT: {name:'Except Winter Night', periods:[PLANET_TIME_PERIODS.WINTER_DAY, PLANET_TIME_PERIODS.SUMMER_DAY, PLANET_TIME_PERIODS.SUMMER_NIGHT]},
  EXCEPT_WINTER_DAY: {name:'Except Winter Day', periods:[PLANET_TIME_PERIODS.WINTER_NIGHT, PLANET_TIME_PERIODS.SUMMER_DAY, PLANET_TIME_PERIODS.SUMMER_NIGHT]},
  EXCEPT_SUMMER_NIGHT: {name:'Except Summer Night', periods:[PLANET_TIME_PERIODS.SUMMER_DAY, PLANET_TIME_PERIODS.WINTER_DAY, PLANET_TIME_PERIODS.WINTER_NIGHT]},
  EXCEPT_SUMMER_DAY: {name:'Except Summer Day', periods:[PLANET_TIME_PERIODS.SUMMER_NIGHT, PLANET_TIME_PERIODS.WINTER_DAY, PLANET_TIME_PERIODS.WINTER_NIGHT]},
  ALWAYS: {name:'Always', periods:PLANET_TIME_PERIODS.ALL}
}
listUtil.addAll(PLANET_TIME_PERIOD_GROUPS)

//only cold to hot
const PLANET_TIME_INTERVALS = {
  NIGHT_TO_DAY: {name:'Night to Day', startPeriods: PLANET_TIME_PERIODS.NIGHTTIME, endPeriods: PLANET_TIME_PERIODS.DAYTIME, priority:0},
  WINTER_TO_SUMMER: {name:'Winter to Summer', startPeriods:PLANET_TIME_PERIODS.WINTERTIME, endPeriods:PLANET_TIME_PERIODS.SUMMERTIME, priority:1},
  WINTER_NIGHT_TO_DAY: {name:'Night to Day (Winter)', startPeriods:[PLANET_TIME_PERIODS.WINTER_NIGHT], endPeriods: [PLANET_TIME_PERIODS.WINTER_DAY], priority:3},
  SUMMER_NIGHT_TO_DAY: {name:'Night to Day (Summer)', startPeriods:[PLANET_TIME_PERIODS.SUMMER_NIGHT], endPeriods: [PLANET_TIME_PERIODS.SUMMER_DAY], priority:4},
}
listUtil.addAll(PLANET_TIME_INTERVALS)

const CHEMICAL_TYPES = {
  GAS: {name:'Gas', weight:1},
  //VAPOR: {name:'Vapor'},
  //LIQUID: {name:'Liquid'},
  SUPER_VOLATILE: {name:'Super-Volatile', weight:1},
  VOLATILE: {name:'Volatile', weight:1},
  METAL: {name:'Metal', weight:1},
}
listUtil.addAll(CHEMICAL_TYPES)
const CHEMICAL_TYPES_METAL_TO_GAS = [CHEMICAL_TYPES.METAL, CHEMICAL_TYPES.VOLATILE, CHEMICAL_TYPES.SUPER_VOLATILE, CHEMICAL_TYPES.GAS]

function createChemical(name, symbol, color, type, weight, triplePoint, criticalPoint, molecularWeight, behaviorType = CHEMICAL_BEHAVIOR_TYPES.TRIPLE_POINT) {
  molecularWeight = rangeUtil.getRatioByMetric(MOLECULAR_WEIGHTS, molecularWeight)
  triplePoint = [ rangeUtil.getRatioByMetric(PRESSURES, triplePoint[0]), rangeUtil.getRatioByMetric(TEMPERATURES, triplePoint[1]), ]
  criticalPoint = [ rangeUtil.getRatioByMetric(PRESSURES, criticalPoint[0]), rangeUtil.getRatioByMetric(TEMPERATURES, criticalPoint[1]), ]
  let solidGasSlope = triplePoint[0]/triplePoint[1]
  let liquidGasSlope = (criticalPoint[0] - triplePoint[0])/(criticalPoint[1] - triplePoint[1])
  console.log({name, molecularWeight, triplePoint, criticalPoint, liquidGasSlope, solidGasSlope})
  //console.log(name,triplePoint,criticalPoint,'SLOPE',solidGasSlope,liquidGasSlope)
  symbol = htmlUtil.colorSpan(symbol, undefined, color)
  weight = weight*type.weight
  //console.log({name,triplePoint,criticalPoint,solidGasSlope,liquidGasSlope,symbol})
  return {name, symbol, color, type, weight, triplePoint, criticalPoint, solidGasSlope, liquidGasSlope, behaviorType, molecularWeight}
}

const CHEMICAL_BEHAVIOR_TYPES = {
  TRIPLE_POINT: {name:'Triple Point'}, //can exist as gas/liquid/solid at a specific temp/pressure point
  GRADIENT: {name:'Gradient'}, //goes from solid to liquid to gas as temperatures increase
}

//weight = likelihood of existing on a given planet IF GEOLOGICALLY POSSIBLE
const CHEMICALS = {
  //gas giant, ice giant, gas dwarf, ice dwarf
  HELIUM: createChemical('Helium', 'He', COLORS.WHITE, CHEMICAL_TYPES.GAS, 1/4, [0.00052,-268.93], [2.26,-267.93], 4, CHEMICAL_BEHAVIOR_TYPES.GRADIENT),
  HYDROGEN: createChemical('Hydrogen', 'H', COLORS.LIGHT_YELLOW, CHEMICAL_TYPES.GAS, 3/4, [0.0708,-259.16], [12.8,-240.17], 2), //3/4

  //ice giant/ice dwarf. since these gasses are clear, they cant be the defining trait of a terrestrial
  NEON: createChemical('Neon', 'Ne', COLORS.PINK, CHEMICAL_TYPES.SUPER_VOLATILE, 1/12, [0.429,-248.59], [27.6,-228.7], 20),
  NITROGEN: createChemical('Nitrogen', 'N', COLORS.DARK_GREEN, CHEMICAL_TYPES.SUPER_VOLATILE, 1/4, [0.125,-209.86], [33.5,-146.9], 28),
  OXYGEN: createChemical('Oxygen', 'O2', COLORS.LIGHT_GREEN, CHEMICAL_TYPES.SUPER_VOLATILE, 1/4, [0.00143,-218.8], [50.4,-118.6], 31),
  CARBON_MONOXIDE: createChemical('Carbon Monoxide', 'CO', COLORS.DARK_YELLOW, CHEMICAL_TYPES.SUPER_VOLATILE, 1/6, [0.0345,-205.04], [34.94,-140.5], 28),
  CARBON_DIOXIDE: createChemical('Carbon Dioxide', 'CO2', COLORS.ORANGE, CHEMICAL_TYPES.SUPER_VOLATILE, 1/3, [5.18,-56.6], [72.8,31.1], 44),

  //ice giant/dwarf OR terrestrial - these substances CAN form clouds
  //ACID: {name:'Acid'},
  WATER: createChemical('Water', 'H2O', COLORS.LIGHT_CYAN, CHEMICAL_TYPES.VOLATILE, 1/2, [0.00604, 0.01], [218.3, 374.15], 18),
  METHANE: createChemical('Methane', 'CH4', COLORS.LIGHT_BLUE, CHEMICAL_TYPES.VOLATILE, 1/3, [0.0117, -182.5], [45.8,-82.6], 16),
  //HYDROCARBON: {name:'Hydrocarbon', type:CHEMICAL_TYPES.VOLATILE},
  AMMONIA: createChemical('Ammonia', 'NH3', COLORS.DARK_BLUE, CHEMICAL_TYPES.VOLATILE, 1/3, [0.00604, -77.7], [112.8, 132.4], 17),
  SULFURIC_ACID: createChemical('Sulfuric Acid', 'H2SO4', COLORS.RED, CHEMICAL_TYPES.VOLATILE, 1/4, [0.00604,10], [45.4, 654], 98, CHEMICAL_BEHAVIOR_TYPES.GRADIENT),   
  //terrestrialG
  SULFUR: createChemical('Sulfur', 'S', COLORS.YELLOW, CHEMICAL_TYPES.METAL, 1/6, [0.205, 115.21], [20.7, 1041], 32),
  CARBON: createChemical('Carbon', 'C', COLORS.GRAY, CHEMICAL_TYPES.METAL, 1/4, [10.8, 3526.85], [73, 4492], 12),
  SILICON: createChemical('Silicon', 'Si', COLORS.GREEN, CHEMICAL_TYPES.METAL, 1/3, [0.086, 1414], [7.56, 3265], 28),
  IRON: createChemical('Iron', 'Fe', COLORS.BLUE, CHEMICAL_TYPES.METAL, 1/3, [0, 1538], [1, 9000], 55),
}
listUtil.addAll(CHEMICALS)
CHEMICALS.METALS = CHEMICALS.ALL.filter(chemical=>chemical.type == CHEMICAL_TYPES.METAL)
CHEMICALS.GASSES = CHEMICALS.ALL.filter(chemical=>chemical.type == CHEMICAL_TYPES.GAS)
CHEMICALS.SUPER_VOLATILES = CHEMICALS.ALL.filter(chemical=>chemical.type == CHEMICAL_TYPES.SUPER_VOLATILE)
CHEMICALS.VOLATILES = CHEMICALS.ALL.filter(chemical=>chemical.type == CHEMICAL_TYPES.VOLATILE)
CHEMICALS.NON_WATER_VOLATILES = CHEMICALS.VOLATILES.filter(v=>(v != CHEMICALS.WATER))
CHEMICALS.NON_GASSES = [...CHEMICALS.SUPER_VOLATILES, ...CHEMICALS.VOLATILES, ...CHEMICALS.METALS]
CHEMICALS.NON_METALS = [...CHEMICALS.GASSES, ...CHEMICALS.SUPER_VOLATILES, ...CHEMICALS.VOLATILES]

const SYSTEM_TYPES = {
  SOLITARY: {name:'Solitary', color:COLORS.GREEN, numStars:1, weight:1},
  BINARY: {name:'Binary', color:COLORS.YELLOW, numStars:2, weight:1/3},
  TRINARY: {name:'Trinary', color:COLORS.RED, numStars:3, weight:1/27},
}
listUtil.addAll(SYSTEM_TYPES)

function createSystemPopulation(name, symbol, color, weight, ageRange, metallicityRange) {
  return {name, symbol, color, weight, ageRange, metallicityRange}
}

const SYSTEM_POPULATIONS = {
  POPULATION_II: createSystemPopulation('Population II', 'II', COLORS.BLUE, 1/3, from(SYSTEM_AGES.OLD), to(SYSTEM_METALLICITIES.LOW)),
  POPULATION_I: createSystemPopulation('Population I', 'I', COLORS.GREEN, 1, to(SYSTEM_AGES.OLD), from(SYSTEM_METALLICITIES.LOW)),
}
listUtil.addAll(SYSTEM_POPULATIONS)


const STAR_FEATURES = {
  SOLAR_FLARES: {name:'Solar Flares'},
  SUN_SPOTS: {name:'Sun-spots'},
}
listUtil.addAll(STAR_FEATURES)

function createStarType(name, symbol, color, weight, mass, luminosity, radiation, radius, ageRange) {
  symbol = htmlUtil.colorSpan(symbol, undefined, color)
  let result = {name, symbol, color, weight, mass, luminosity, radiation, radius, ageRange}
  return result
}
let cst = createStarType

const STAR_TYPES = { //MUST be arranged oldest and most massive to least
  //dead
  //SUPER_MASSIVE_BLACK_HOLE: cst('Super-Massive Black Hole', MASSES.EXTREMELY_HEAVY, LUMINOSITIES.BLACK, RADII.SMALL, from(SYSTEM_AGES.EXTREMELY_OLD)),
  //INTERMEDIATE_BLACK_HOLE: cst('Intermediate-Mass Black Hole', MASSES.VERY_HEAVY, LUMINOSITIES.BLACK, RADII.VERY_SMALL, from(SYSTEM_AGES.OLD)),

  //explode
  BLUE_HYPERGIANT: cst('Blue Hypergiant', 'H', COLORS.LIGHT_BLUE, 0.5/64, MASSES.EXTREMELY_HEAVY, LUMINOSITIES.EXTREMELY_BRIGHT, RADIATION_LEVELS.EXTREMELY_HIGH, RADII.EXTREMELY_LARGE, [SYSTEM_AGES.EXTREMELY_YOUNG]),
  YELLOW_HYPERGIANT: cst('Yellow Hypergiant', 'H', COLORS.LIGHT_YELLOW, 1/64, MASSES.EXTREMELY_HEAVY, LUMINOSITIES.VERY_BRIGHT, RADIATION_LEVELS.VERY_HIGH, RADII.EXTREMELY_LARGE, [SYSTEM_AGES.EXTREMELY_YOUNG]),
  ORANGE_HYPERGIANT: cst('Orange Hypergiant', 'H', COLORS.LIGHT_ORANGE, 2/64, MASSES.EXTREMELY_HEAVY, LUMINOSITIES.BRIGHT, RADIATION_LEVELS.HIGH, RADII.EXTREMELY_LARGE, [SYSTEM_AGES.EXTREMELY_YOUNG]),
  RED_HYPERGIANT: cst('Red Hypergiant', 'H',COLORS.LIGHT_RED, 4/64, MASSES.EXTREMELY_HEAVY, LUMINOSITIES.MEDIUM, RADIATION_LEVELS.MEDIUM, RADII.EXTREMELY_LARGE, [SYSTEM_AGES.EXTREMELY_YOUNG]),
  //become black holes
  BLUE_SUPERGIANT: cst('Blue Supergiant', 'S', COLORS.BLUE, 0.5/16, MASSES.HEAVY, LUMINOSITIES.EXTREMELY_BRIGHT, RADIATION_LEVELS.EXTREMELY_HIGH, RADII.VERY_LARGE, to(SYSTEM_AGES.VERY_YOUNG)),
  YELLOW_SUPERGIANT: cst('Yellow Supergiant', 'S', COLORS.YELLOW, 1/16, MASSES.HEAVY, LUMINOSITIES.VERY_BRIGHT, RADIATION_LEVELS.VERY_HIGH, RADII.VERY_LARGE, to(SYSTEM_AGES.VERY_YOUNG)),
  ORANGE_SUPERGIANT: cst('Orange Supergiant', 'S', COLORS.ORANGE, 2/16, MASSES.HEAVY, LUMINOSITIES.BRIGHT, RADIATION_LEVELS.HIGH, RADII.VERY_LARGE, to(SYSTEM_AGES.VERY_YOUNG)),
  RED_SUPERGIANT: cst('Red Supergiant', 'S', COLORS.RED, 4/16, MASSES.HEAVY, LUMINOSITIES.MEDIUM, RADIATION_LEVELS.MEDIUM, RADII.VERY_LARGE, to(SYSTEM_AGES.VERY_YOUNG)),
  BLACK_HOLE: cst('Stellar Black Hole', 'B', COLORS.PURPLE, 1/16, MASSES.HEAVY, LUMINOSITIES.BLACK, RADIATION_LEVELS.PERFORATING, RADII.EXTREMELY_SMALL, from(SYSTEM_AGES.YOUNG)),
  //become neutron stars
  BLUE_GIANT: cst('Blue Giant', 'G', COLORS.BLUE, 0.5/4, MASSES.HEAVY, LUMINOSITIES.EXTREMELY_BRIGHT, RADIATION_LEVELS.EXTREMELY_HIGH, RADII.LARGE, to(SYSTEM_AGES.YOUNG)),
  YELLOW_GIANT: cst('Yellow Giant', 'G', COLORS.YELLOW, 1/4, MASSES.HEAVY, LUMINOSITIES.VERY_BRIGHT, RADIATION_LEVELS.VERY_HIGH, RADII.LARGE, to(SYSTEM_AGES.YOUNG)),
  ORANGE_GIANT: cst('Orange Giant', 'G', COLORS.ORANGE, 2/4, MASSES.HEAVY, LUMINOSITIES.BRIGHT, RADIATION_LEVELS.HIGH, RADII.LARGE, to(SYSTEM_AGES.YOUNG)),
  NEUTRON_STAR: cst('Neutron Star', 'N', COLORS.LIGHT_GRAY, 1/4, MASSES.LIGHT, LUMINOSITIES.VERY_BRIGHT, RADIATION_LEVELS.MEDIUM, RADII.EXTREMELY_SMALL, from(SYSTEM_AGES.OLD)),
  //become red giants -> white dwarves
  YELLOW_DWARF: cst('Yellow Dwarf', 'D', COLORS.YELLOW, 1, MASSES.MEDIUM, LUMINOSITIES.BRIGHT, RADIATION_LEVELS.MEDIUM, RADII.MEDIUM, to(SYSTEM_AGES.MEDIUM)),
  ORANGE_DWARF: cst('Orange Dwarf', 'D', COLORS.ORANGE, 2/3, MASSES.MEDIUM, LUMINOSITIES.MEDIUM, RADIATION_LEVELS.LOW, RADII.MEDIUM, to(SYSTEM_AGES.MEDIUM)),
  RED_GIANT: cst('Red Giant', 'D', COLORS.RED, 1, MASSES.LIGHT, LUMINOSITIES.MEDIUM, RADIATION_LEVELS.VERY_LOW, RADII.LARGE, [SYSTEM_AGES.OLD]),
  WHITE_DWARF: cst('White Dwarf', 'D', COLORS.WHITE, 1, MASSES.EXTREMELY_LIGHT, LUMINOSITIES.DIM, RADIATION_LEVELS.EXTREMELY_LOW, RADII.EXTREMELY_SMALL, from(SYSTEM_AGES.OLD)),
  //straight to white dwarves
  RED_DWARF: cst('Red Dwarf', 'D', COLORS.RED, 3/4, MASSES.VERY_LIGHT, LUMINOSITIES.DIM, RADIATION_LEVELS.EXTREMELY_LOW, RADII.SMALL, to(SYSTEM_AGES.EXTREMELY_OLD)),
  //straight to black dwarves
  BROWN_DWARF: cst('Brown Dwarf', 'D', COLORS.BROWN, 1/4, MASSES.EXTREMELY_LIGHT, LUMINOSITIES.EXTREMELY_DIM, RADIATION_LEVELS.TRACE, RADII.VERY_SMALL, to(SYSTEM_AGES.EXTREMELY_OLD)),
 
  PROTO_STAR: cst('Proto-star', 'P', COLORS.PINK, 1, MASSES.EXTREMELY_LIGHT, LUMINOSITIES.EXTREMELY_DIM, RADIATION_LEVELS.EXTREMELY_HIGH, RADII.VERY_SMALL, [SYSTEM_AGES.EXTREMELY_YOUNG]),
}
listUtil.addAll(STAR_TYPES)


const GEOSPHERE_DEPTHS = {
  CORE: {name:'Core', matterStates:[...MATTER_STATES.SOLIDS, ...MATTER_STATES.LIQUIDS]},
  INNER: {name:'Inner', matterStates:[...MATTER_STATES.SOLIDS, ...MATTER_STATES.LIQUIDS]},
  SURFACE: {name:'Surface', matterStates:[...MATTER_STATES.SOLIDS, ...MATTER_STATES.LIQUIDS]},
  OUTER: {name:'Outer', matterStates:MATTER_STATES.GASSES}
}
listUtil.addAll(GEOSPHERE_DEPTHS)

const GEOSPHERE_LAYERS = {
  //gas planets only
  GAS_CORE: {name:'Gas Core', chemicals:CHEMICALS.GASSES, matterStates:[...MATTER_STATES.SOLIDS, ...MATTER_STATES.LIQUIDS], depth:GEOSPHERE_DEPTHS.CORE},
  GAS_MANTLE: {name:'Intermediate Layer', chemicals:CHEMICALS.GASSES, matterStates:[...MATTER_STATES.SOLIDS, ...MATTER_STATES.LIQUIDS], depth:GEOSPHERE_DEPTHS.INNER},
  //terrestrial only
  CORE: {name:'Core', chemicals:CHEMICALS.METALS, matterStates:[...MATTER_STATES.SOLIDS, ...MATTER_STATES.LIQUIDS], depth:GEOSPHERE_DEPTHS.CORE}, //liquid metal
  MANTLE: {name:'Mantle', chemicals:[...CHEMICALS.METALS, ...CHEMICALS.VOLATILES], matterStates:[...MATTER_STATES.SOLIDS, ...MATTER_STATES.LIQUIDS], depth:GEOSPHERE_DEPTHS.INNER}, //liquid metal
  LITHOSPHERE: {name:'Lithosphere', chemicals:CHEMICALS.METALS, matterStates:MATTER_STATES.SOLIDS, depth:GEOSPHERE_DEPTHS.SURFACE}, //solid metal - floats due to being made up of less-dense compounds
  SUB_CRYOSPHERE: {name:'Sub-Cryosphere', chemicals:CHEMICALS.NON_WATER_VOLATILES, matterStates:MATTER_STATES.SOLIDS, depth:GEOSPHERE_DEPTHS.SURFACE},
  HYDROSPHERE: {name:'Hydrosphere', chemicals:[...CHEMICALS.GASSES, ...CHEMICALS.SUPER_VOLATILES, ...CHEMICALS.VOLATILES], matterStates:MATTER_STATES.LIQUIDS, depth:GEOSPHERE_DEPTHS.SURFACE},
  CRYOSPHERE: {name:'Cryosphere', chemicals:[...CHEMICALS.GASSES, ...CHEMICALS.SUPER_VOLATILES, CHEMICALS.WATER], matterStates:MATTER_STATES.SOLIDS, depth:GEOSPHERE_DEPTHS.SURFACE},
  //both 
  CLOUDS: {name:'Clouds', chemicals:[...CHEMICALS.VOLATILES, ...CHEMICALS.METALS], matterStates:MATTER_STATES.GASSES, depth:GEOSPHERE_DEPTHS.OUTER},
  ATMOSPHERE: {name:'Atmosphere', chemicals:[...CHEMICALS.GASSES, ...CHEMICALS.SUPER_VOLATILES], matterStates:MATTER_STATES.GASSES, depth:GEOSPHERE_DEPTHS.OUTER}, 
}
listUtil.addAll(GEOSPHERE_LAYERS)
GEOSPHERE_DEPTHS.CORE.layers = GEOSPHERE_LAYERS.CORE = GEOSPHERE_LAYERS.ALL.filter(l=>(l.depth == GEOSPHERE_DEPTHS.CORE))
GEOSPHERE_DEPTHS.INNER.layers = GEOSPHERE_LAYERS.INNERS = GEOSPHERE_LAYERS.ALL.filter(l=>(l.depth == GEOSPHERE_DEPTHS.INNER))
GEOSPHERE_DEPTHS.SURFACE.layers = GEOSPHERE_LAYERS.SURFACES = GEOSPHERE_LAYERS.ALL.filter(l=>(l.depth == GEOSPHERE_DEPTHS.SURFACE))
GEOSPHERE_DEPTHS.OUTER.layers = GEOSPHERE_LAYERS.OUTERS = GEOSPHERE_LAYERS.ALL.filter(l=>(l.depth == GEOSPHERE_DEPTHS.OUTER))
GEOSPHERE_LAYERS.TERRESTRIAL_LAYERS = [GEOSPHERE_LAYERS.CORE, GEOSPHERE_LAYERS.MANTLE, GEOSPHERE_LAYERS.LITHOSPHERE, GEOSPHERE_LAYERS.SUB_CRYOSPHERE, GEOSPHERE_LAYERS.HYDROSPHERE, GEOSPHERE_LAYERS.CRYOSPHERE, GEOSPHERE_LAYERS.CLOUDS, GEOSPHERE_LAYERS.ATMOSPHERE]
GEOSPHERE_LAYERS.GAS_LAYERS = [GEOSPHERE_LAYERS.CORE, GEOSPHERE_LAYERS.GAS_CORE, GEOSPHERE_LAYERS.GAS_MANTLE, GEOSPHERE_LAYERS.CLOUDS, GEOSPHERE_LAYERS.ATMOSPHERE]

//always cold->hot. no day/night transition if planet is tidally locked
const GEOSPHERE_LAYER_TRANSITIONS = {
  MAGMA_TO_LITHOSPHERE: {name:'Crust Melting', colderLayer:GEOSPHERE_LAYERS.LITHOSPHERE, hotterLayer:GEOSPHERE_LAYERS.MANTLE},
  MAGMA_TO_CLOUDS: {name:'Magma Boiling', colderLayer:GEOSPHERE_LAYERS.MANTLE, hotterLayer:GEOSPHERE_LAYERS.CLOUDS},
  LITHOSPHERE_TO_CLOUDS: {name:'Crust Boiling', colderLayer:GEOSPHERE_LAYERS.LITHOSPHERE, hotterLayer:GEOSPHERE_LAYERS.CLOUDS},
  SUB_CRYOSPHERE_TO_HYDROSPHERE: {name:'Sub-Surface Glaciers Melting', colderLayer:GEOSPHERE_LAYERS.SUB_CRYOSPHERE, hotterLayer:GEOSPHERE_LAYERS.HYDROSPHERE},
  SUB_CRYOSPHERE_TO_CLOUDS: {name:'Sub-Surface Glaciers Boiling', colderLayer:GEOSPHERE_LAYERS.SUB_CRYOSPHERE, hotterLayer:GEOSPHERE_LAYERS.CLOUDS},
  SUB_CRYOSPHERE_TO_ATMOSPHERE: {name:'Sub-Surface Glaciers Subliming', colderLayer:GEOSPHERE_LAYERS.SUB_CRYOSPHERE, hotterLayer:GEOSPHERE_LAYERS.ATMOSPHERE},
  HYDROSPHERE_TO_CRYOSPHERE: {name:'Glaciers Melting', colderLayer:GEOSPHERE_LAYERS.CRYOSPHERE, hotterLayer:GEOSPHERE_LAYERS.HYDROSPHERE},
  HYDROSPHERE_TO_CLOUDS: {name:'Oceans Boiling', colderLayer:GEOSPHERE_LAYERS.HYDROSPHERE, hotterLayer:GEOSPHERE_LAYERS.CLOUDS},
  HYDROSPHERE_TO_ATMOSPHERE: {name:'Oceans Evaporating', colderLayer:GEOSPHERE_LAYERS.HYDROSPHERE, hotterLayer:GEOSPHERE_LAYERS.ATMOSPHERE},
  CRYOSPHERE_TO_CLOUDS: {name:'Glaciers Boiling', colderLayer:GEOSPHERE_LAYERS.CRYOSPHERE, hotterLayer:GEOSPHERE_LAYERS.CLOUDS},
  CRYOSPHERE_TO_ATMOSPHERE: {name:'Glaciers Subliming', colderLayer:GEOSPHERE_LAYERS.CRYOSPHERE, hotterLayer:GEOSPHERE_LAYERS.ATMOSPHERE},
}
listUtil.addAll(GEOSPHERE_LAYER_TRANSITIONS)

function createPlanetCategory(name, symbol, terrestrial, color, lithospheres, liquispheres, atmospheres, layers) {
  return {name, symbol, terrestrial, color, lithospheres, liquispheres, atmospheres, layers}  
}

const PLANET_TYPES = {
  TERRESTRIAL_GIANT: createPlanetCategory('Terrestrial Giant', 'G', true, COLORS.GREEN, CHEMICALS.METALS, CHEMICALS.VOLATILES, CHEMICALS.NON_METALS, GEOSPHERE_LAYERS.TERRESTRIAL_LAYERS),
  TERRESTRIAL_DWARF: createPlanetCategory('Terrestrial Planet', 'D', true, COLORS.DARK_GREEN, CHEMICALS.METALS, CHEMICALS.VOLATILES, CHEMICALS.NON_METALS, GEOSPHERE_LAYERS.TERRESTRIAL_LAYERS),
  ICE_GIANT: createPlanetCategory('Ice Giant', 'G', false, COLORS.BLUE, [], CHEMICALS.VOLATILES, CHEMICALS.GASSES, GEOSPHERE_LAYERS.GAS_LAYERS),
  ICE_DWARF: createPlanetCategory('Ice Dwarf', 'D', false, COLORS.DARK_BLUE, [], CHEMICALS.VOLATILES, CHEMICALS.GASSES, GEOSPHERE_LAYERS.GAS_LAYERS),
  GAS_GIANT: createPlanetCategory('Gas Giant', 'G', false, COLORS.YELLOW, [], CHEMICALS.NON_GASSES, CHEMICALS.GASSES, GEOSPHERE_LAYERS.GAS_LAYERS),
  GAS_DWARF: createPlanetCategory('Gas Dwarf', 'D', false, COLORS.DARK_YELLOW, [], CHEMICALS.NON_GASSES, CHEMICALS.GASSES, GEOSPHERE_LAYERS.GAS_LAYERS),
}
listUtil.addAll(PLANET_TYPES)

const PLANET_SURFACES = {
  LAVA: {name:'Lava', color:COLORS.RED, layer:GEOSPHERE_LAYERS.MAGMA, chemicals:CHEMICALS.METALS, matterStates:MATTER_STATES.LIQUIDS},

  //terrestrial
  METAL: {name:'Metal', color:COLORS.GRAY, layer:GEOSPHERE_LAYERS.LITHOSPHERE, chemicals:[CHEMICALS.IRON], matterStates:[MATTER_STATES.COMPRESSED_SOLID, MATTER_STATES.SOLID]},
  ROCK: {name:'Rock', color:COLORS.LIGHT_BROWN, layer:GEOSPHERE_LAYERS.LITHOSPHERE, chemicals:CHEMICALS.METALS, matterStates:[MATTER_STATES.COMPRESSED_SOLID, MATTER_STATES.SOLID, MATTER_STATES.FROZEN_SOLID]},
  CRYSTAL: {name:'Crystal', color:COLORS.LIGHT_BLUE, layer:GEOSPHERE_LAYERS.LITHOSPHERE, chemicals:[CHEMICALS.CARBON], matterStates:[MATTER_STATES.COMPRESSED_SOLID]},
  DESERT: {name:'Desert', color:COLORS.LIGHT_YELLOW, layer:GEOSPHERE_LAYERS.LITHOSPHERE, chemicals:CHEMICALS.METALS, matterStates:[MATTER_STATES.COMPRESSED_SOLID, MATTER_STATES.SOLID, MATTER_STATES.FROZEN_SOLID]},
  TAR: {name:'Tar', color:COLORS.DARK_BROWN, layer:GEOSPHERE_LAYERS.LITHOSPHERE, chemicals:[CHEMICALS.CARBON, CHEMICALS.SULFUR], matterStates:[MATTER_STATES.SOLID]},

  //terrestrial with a hydrosphere
  OCEAN: {name:'Ocean', color:COLORS.BLUE, layer:GEOSPHERE_LAYERS.HYDROSPHERE, chemicals:CHEMICALS.VOLATILES, matterStates:MATTER_STATES.LIQUIDS},
  LAKE: {name:'Lake', color:COLORS.DARK_BLUE, layer:GEOSPHERE_LAYERS.HYDROSPHERE, chemicals:CHEMICALS.VOLATILES, matterStates:MATTER_STATES.LIQUIDS},

  //terrestrial with a cryosphere
  SNOW: {name:'Snow', color:COLORS.WHITE, layer:GEOSPHERE_LAYERS.CRYOSPHERE, chemicals:CHEMICALS.VOLATILES, matterStates:MATTER_STATES.SOLIDS},
  ICE: {name:'Ice', color:COLORS.LIGHT_GRAY, layer:GEOSPHERE_LAYERS.CRYOSPHERE, chemicals:CHEMICALS.VOLATILES, matterStates:MATTER_STATES.SOLIDS},
  
  //SUBSURFACE_ICE: {name:'Subsurface Ice', color:COLORS.LIGHT_GRAY, layer:GEOSPHERE_LAYERS.SUB_CRYOSPHERE, chemicals:CHEMICALS.VOLATILES, matterStates:MATTER_STATES.SOLIDS},
  //OCEAN_FLOOR: {name:'Ocean Floor', color:COLORS.LIGHT_GRAY, layer:GEOSPHERE_LAYERS.SUB_CRYOSPHERE, chemicals:CHEMICALS.VOLATILES, matterStates:MATTER_STATES.SOLIDS},


  //post-life
  //SLIME: {name:'Slime'},
}
listUtil.addAll(PLANET_SURFACES)
PLANET_SURFACES.LITHOSPHERES = PLANET_SURFACES.ALL.filter(surface=>surface.layer == GEOSPHERE_LAYERS.LITHOSPHERE)
PLANET_SURFACES.HYDROSPHERES = PLANET_SURFACES.ALL.filter(surface=>surface.layer == GEOSPHERE_LAYERS.HYDROSPHERE)
PLANET_SURFACES.CRYOSPHERES = PLANET_SURFACES.ALL.filter(surface=>surface.layer == GEOSPHERE_LAYERS.CRYOSPHERE)
PLANET_SURFACES.SOLIDS = [PLANET_SURFACES.METAL, PLANET_SURFACES.ROCK, PLANET_SURFACES.CRYSTAL, PLANET_SURFACES.DESERT]

const GEOGRAPHICAL_FEATURES = {
  SUBSURFACE_OCEANS: {name:'Subsurface Oceans', surfaces:PLANET_SURFACES.HYDROSPHERES, requirements:{liquid:true}},
  SEA_FLOOR: {name:'Sea Floor', surfaces:PLANET_SURFACES.HYDROSPHERES, requirements:{liquid:true}},
  UNDERWATER_VOLCANOES: {name:'Underwater Volcanoes', surfaces:PLANET_SURFACES.HYDROSPHERES, requirements:{liquid:true, geologicalActivity:true}},
  CAVES: {name:'Caves', surfaces:PLANET_SURFACES.SOLIDS, requirements:{}},
  MOUNTAINS: {name:'Mountains', surfaces:PLANET_SURFACES.SOLIDS, requirements:{}},
  IMPACT_CRATERS: {name:'Impact Craters', surfaces:PLANET_SURFACES.SOLIDS, requirements:{geologicalActivity:false}},
  VOLCANOES: {name:'Volcanoes', surfaces:PLANET_SURFACES.SOLIDS, requirements:{geologicalActivity:true}},
  CRYO_VOLCANOES: {name:'Cryo-Volcanoes', surfaces:PLANET_SURFACES.CRYOSPHERES, requirements:{geologicalActivity:true, liquid:true}},
  GLACIERS: {name:'Glaciers', surfaces:PLANET_SURFACES.CRYOSPHERES, requirements:{}},
}
listUtil.addAll(GEOGRAPHICAL_FEATURES)

const WEATHER_FEATURES = {
  RUNAWAY_ICE_ALBEDO_EFFECT: {name:'Runaway Ice-Albedo Effect'},
  RUNAWAY_GREENHOUSE_EFFECT: {name:'Runaway Greenhouse Effect'},
  EXTREME_WINDS: {name:'Extreme Winds'}, //atmosphere + "swingy" temperatures
  RAIN: {name:'Rain'}, //clouds + temperature changes
  FOG: {name:'Fog'}, //see above?
  BLIZZARDS: {name:'Blizzards'}, //cryosphere + wind
  DUST_STORMS: {name:'Dust Storms'}, //desert + wind
  TSUNAMIS: {name:'Tsunamis'}, //geological activity + water
  LIGHTNING: {name:'Lightning'}, //thick atmosphere + clouds + conductive atmosphere
  EARTHQUAKES: {name:'Earthquakes'}, //geological activity
}
listUtil.addAll(WEATHER_FEATURES)

const PLANET_FEATURES = {
  RINGS: {name:'Rings'}, //good for colonizing/resources
  TIDAL_HEATING: {name:'Tidal Heating'}, //hotter than usual internal temp
}
listUtil.addAll(PLANET_FEATURES)

const ORBIT_FEATURES = {
  ECCENTRIC: {name:'Eccentric'}, //more extreme winter/summer, tidal heating
  RETROGRADE: {name:'Retrograde'}, //more extreme weather, less moons, tidal heating
  //COMPLEX: {name:'Complex'}, //planet's temperature is semi random
}
listUtil.addAll(ORBIT_FEATURES)

function createBiologyType(name, bases, solvents) {
  return {name, bases, solvents}
}
//bases must be solid/liquid, solvents must be liquid/super-critical fluid (SCF=hydrogen or carbon dioxide)
const BIO_CHEMISTRY_TYPES = {
  IRON_BASED: createBiologyType('Metal-based', [CHEMICALS.IRON], [CHEMICALS.WATER, CHEMICALS.METHANE, CHEMICALS.SULFUR, CHEMICALS.AMMONIA, CHEMICALS.SULFURIC_ACID]), //metal oxides
  SILICON_BASED: createBiologyType('Silicon-based', [CHEMICALS.SILICON], [CHEMICALS.METHANE, CHEMICALS.SULFUR, CHEMICALS.AMMONIA]),
  SULFUR_BASED: createBiologyType('Sulfur-based', [CHEMICALS.SULFUR], [CHEMICALS.SULFUR, CHEMICALS.METHANE, CHEMICALS.AMMONIA, CHEMICALS.SULFURIC_ACID]),
  CARBON_BASED: createBiologyType('Carbon-based', [CHEMICALS.CARBON], [CHEMICALS.WATER, CHEMICALS.METHANE, CHEMICALS.AMMONIA, CHEMICALS.HYDROGEN, CHEMICALS.CARBON_DIOXIDE, CHEMICALS.SULFURIC_ACID]),
  NITROGEN_BASED: createBiologyType('Nitrogen-based', [CHEMICALS.NITROGEN], [CHEMICALS.WATER, CHEMICALS.AMMONIA, CHEMICALS.HYDROGEN, CHEMICALS.SULFURIC_ACID]), //really cold
  //PLASMA_BASED: createBiologyType('Plasma-based', x)
  //BORON_BASED: {},
}
listUtil.addAll(BIO_CHEMISTRY_TYPES)
//simulate some unknowns
for (let scf of [CHEMICALS.HYDROGEN, CHEMICALS.HELIUM, CHEMICALS.CARBON_DIOXIDE, CHEMICALS.NITROGEN]) for (let biologyType of BIO_CHEMISTRY_TYPES.ALL) if (Math.random() < .33) arrUtil.safeAdd(biologyType.solvents, scf)


const ENERGY_SOURCES = {
  SOLAR: {name:'Solar'}, //sunlight
  RADIATION: {name:'Radiation'}, //gamma and x rays. may penetrate further than solar
  CHEMICAL: {name:'Chemical'}, //eating substances and combining them with internal chemicals to release energy
  GEOTHERMAL: {name:'Geothermal'}, //vents, volcanoes, etc
  IONIC: {name:'Ionic'}, //charged particles
  ELECTRIC: {name:'Electric'}, //storms or static e in high pressure atmospheres
}
listUtil.addAll(ENERGY_SOURCES)
