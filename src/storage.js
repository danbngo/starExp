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

class StarCluster {
  constructor({starSystems = []} = {}) {
    this.starSystems = starSystems
  }
}

class Orbit {
  constructor({center, distance = 1} = {}) {
    this.center = center
    this.distance = distance
  }
}

class AstronomicalObject {
  constructor({children = [], parent, orbit, features = []} = {}) {
    this.children = children
    this.parent = parent
    this.features = features
    for (let child of children) child.parent = this
    this.orbit = orbit
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

class StarSystem extends AstronomicalObject {
  constructor({stars = [], age = SYSTEM_AGES.ANCIENT, population = SYSTEM_POPULATIONS.POPULATION_I, metallicity = SYSTEM_METALLICITIES.EXTREMELY_HIGH, type = SYSTEM_TYPES.SOLITARY, features = []} = {}) {
    super({children:stars, features})
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
  constructor({planets = [], type = STAR_TYPES.BROWN_DWARF} = {}, features = []) {
    super({children:planets, features})
    this.type = type
  }
}

class Planetoid extends AstronomicalObject {
  constructor({orbit, type = PLANET_TYPES.GAS_DWARF, moons = [], features = []} = {}) {
    super({children:moons, orbit, features})
    this.type = type
    this.moons = moons
  }
}

class Planet extends Planetoid {}
class Moon extends Planetoid {}

class GameState {
  constructor() {
    this.captain = new Captain()
    this.ships = []
    this.starCluster = new StarCluster()
    this.starSystem = new StarSystem()
    this.planet = new Planet()
    this.moon = new Moon()
  }
}

let gs = new GameState()