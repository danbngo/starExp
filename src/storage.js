class Ship {
  constructor({hull = [100,100], shields = [100,100], energy = [100,100], crew = [100,100], cargo = [0,100],
    lasers = 10, radars = 10, torpedoes = 10, probes = 10, fighters = 10} = {}) {
      this.hull = hull
      this.shields = shields
      this.energy = energy
      this.crew = crew
      this.cargo = cargo
      this.lasers = lasers
      this.radars = radars
      this.torpedoes = torpedoes
      this.probes = probes
      this.fighters = fighters
    }
}

class Captain {
  constructor({credits = 100, fame = 0, infamy = 0, bounty = 0} = {}) {
    this.credits = credits
    this.fame = fame
    this.infamy = infamy
    this.bounty = bounty
  }
}


class Orbit {
  constructor({center, proximity = PROXIMITIES.CLOSE, proximityRatio} = {}) {
    this.center = center
    this.proximity = proximity
    this.proximityRatio = proximityRatio
  }
}

class AstronomicalObject {
  constructor({name = '', description = '', children = [], parent, orbit, features = []} = {}) {
    this.name = name
    this.description = description
    this.children = children
    this.parent = parent
    this.features = features
    for (let child of children) child.parent = this
    this.orbit = orbit
    this.proximity = orbit ? orbit.proximity : undefined
    this.id = rndUtil.numBetween(0,1*TRIL)
  }
  getChildrenRecursive() {
    let results = []
    let children = this.children
    let nextChildren = []
    while (children.length > 0) {
      for (let child of children) {
        if (!results.includes(child)) results.push(child)
        if (child.children && child.children.length > 0) nextChildren = [...nextChildren, ...child.children]
      }
      children = nextChildren
      nextChildren = []
    }
    return results
  }
}

class StarCluster extends AstronomicalObject {
  constructor({systems = [], description = '', name = ''} = {}) {
    super({children:systems, name, description})
    this.systems = systems
  }
}

class StarSystem extends AstronomicalObject {
  constructor({name = '', description = '', stars = [], age = SYSTEM_AGES.ANCIENT, population = SYSTEM_POPULATIONS.POPULATION_I, metallicity = SYSTEM_METALLICITIES.EXTREMELY_HIGH, type = SYSTEM_TYPES.SOLITARY, features = []} = {}) {
    super({name, description, children:stars, features})
    this.stars = stars
    this.age = age
    this.metallicity = metallicity
    this.population = population
    this.type = type
  }
  get planets() {
    return this.getChildrenRecursive().filter(child=>(child instanceof Planet))
  }
  get moons() {
    return this.getChildrenRecursive().filter(child=>(child instanceof Moon))
  }
}

class Star extends AstronomicalObject {
  constructor({name = '', description = '', planets = [], type = STAR_TYPES.BROWN_DWARF, orbit, features = [], 
  mass = MASSES.EXTREMELY_HEAVY, radius = RADII.EXTREMELY_LARGE, luminosity = LUMINOSITIES.BLACK, radiation = RADIATION_LEVELS.LOW, chemicalAbundances} = {}, ) {
    super({children:planets, features, name, description, orbit})
    this.type = type
    this.mass = mass
    this.radius = radius
    this.radiation = radiation
    this.luminosity = luminosity
    this.chemicalAbundances = chemicalAbundances
  }
}

class GeosphereTransition {
  constructor({type = GEOSPHERE_LAYER_TRANSITIONS.CRYOSPHERE_TO_ATMOSPHERE, chemical, interval = PLANET_TIME_INTERVALS.NIGHT_TO_DAY}) {
    this.type = type
    this.chemical = chemical
    this.interval = interval
  }
}

class Geosphere {
  constructor() {
    this.layers = new Map(GEOSPHERE_LAYERS.ALL.map(layer=>[ layer,[] ]))
    this.chemicalStates = new Map()
    this.surfaces = []
    this.transitions = []
  }
  getChemicalLayers(chemical) {
    let result = []
    for (let [layer, chemicals] of this.layers) {
      if (chemicals.includes(chemical)) result.push(layer)
    }
    return result
  }
  getChemicals() {
    let keys = this.chemicalStates.keys()
    let chemicals = []
    chemicalLoop: for (let chemical of CHEMICALS.ALL) for (let key of keys) if (key.includes(chemical)) {
      chemicals.push(chemical)
      continue chemicalLoop
    }
    return chemicals
  }
}

class Planetoid extends AstronomicalObject {
  constructor({name = '', description = '', orbit, type = PLANET_TYPES.GAS_DWARF, moons = [], features = [], mass = MASSES.EXTREMELY_HEAVY, radius = RADII.EXTREMELY_LARGE,
  dayLength = DAY_LENGTHS.MEDIUM, gravity = GRAVITY_LEVELS.EXTREMELY_HIGH, atmosphericPressure = PRESSURES.EXTREMELY_HIGH,
  axialTilt = TILTS.EXTREMELY_PRONOUNCED, temperatures = new Map(),
  geologicalActivity = GEOLOGICAL_ACTIVITY_LEVELS.NONE, magnetosphere = MAGNETIC_FIELD_LEVELS.NONE, radiation = RADIATION_LEVELS.EXTREMELY_HIGH,
  geospheres, geosphere, surfaces, bioChemistry,
  } = {}) {
    super({children:moons, orbit, features, name, description})
    this.type = type
    this.moons = moons
    this.mass = mass
    this.radius = radius
    this.gravity = gravity
    this.dayLength = dayLength
    this.axialTilt = axialTilt
    this.atmosphericPressure = atmosphericPressure
    this.geologicalActivity = geologicalActivity
    this.magnetosphere = magnetosphere
    this.radiation = radiation
    this.temperatures = temperatures
    this.gravity = gravity
    this.bioChemistry = bioChemistry
    this.geosphere = geosphere
    this.geospheres = geospheres
    this.surfaces = surfaces
    //if (this.transientGeosphere) for (let layer of GEOSPHERE_LAYER_NAMES) this[layer] = this.transientGeosphere[layer]
  }
}

class Planet extends Planetoid {}
class Moon extends Planetoid {}

class BioChemistry {
  constructor({type = BIO_CHEMISTRY_TYPES.CARBON_BASED, base, solvent, energySource, 
  temperatureRange = [], gravityRange = [], pressureRange = [], radiationRange = []
  } = {}) {
    this.type = type
    this.base = base //carbon, silicon, metal + heteropoly acids (oxygen), boranes, phosphorous, sulfur
    this.solvent = solvent //water, ammonia, sulfuric acid, methane (hydrocarbons), liqud nitrogen, supercritical hydrogen (low temperature induced), hydroflouric acid, hydrogen sulfide
    this.energySource = energySource //light, radiation, lightning/electricity, thermal vents/volcanoes, lithotrophy/chemical breakdown, charged particle absorption
    this.temperatureRange = temperatureRange
    this.gravityRange = gravityRange
    this.pressureRange = pressureRange
    this.radiationRange = radiationRange
  }
}
//life is unlikely to emerge on a world with chemicals that would react with its base components - ie, most solvents+oxygen, 
//chirality - covered over which life is "compatible with" others



class GameState {
  constructor() {
    this.captain = new Captain()
    this.ships = []
    this.starCluster = new StarCluster()
    this.system = new StarSystem()
    this.planet = new Planet()
    this.moon = new Moon()
  }
}

let gs = new GameState()