
class orbitGenerator {
  static genOrbit(object, possibleCenters = []) {
    possibleCenters = possibleCenters.filter(center=>(center.mass > object.mass))
    let center = rndUtil.memberOf(possibleCenters)
    let distance = rndUtil.memberOf(ORBIT_DISTANCES.ALL)
    return new Orbit({center, distance})
  }
  static assignOrbit(object, possibleCenters = []) {
    let orbit = orbitGenerator.genOrbit(object, possibleCenters)
    object.parent = orbit.center
    return orbit
  }
}

class starClusterGenerator {
  static genStarCluster() {
    let properties = {}
    properties.starSystems = systemGenerator.genSystems(properties)
    let starCluster = new StarCluster(properties)
    return starCluster
  }
}

class systemGenerator {
  static genSystems(starCluster) {
    let systems = []
    let numSystems = rndUtil.numBetweenSqrt(100,300,true)
    for (let i = 0; i < numSystems; i++) systems.push(systemGenerator.genSystem(starCluster))
    return systems
  }
  static genSystem(starCluster) {
    let systemAttributes = systemGenerator.genSystemAttributes(starCluster)
    systemAttributes.stars = starGenerator.genStars(systemAttributes)
    return new StarSystem(systemAttributes)
  }
  static genSystemAttributes(starCluster) {
    let population = rndUtil.memberOfWeighted(SYSTEM_POPULATIONS.ALL) || SYSTEM_POPULATIONS.POPULATION_I
    let age = rndUtil.memberOf(population.ageRange)
    let metallicity = rndUtil.memberOf(population.metallicityRange)
    let type = rndUtil.memberOfWeighted(SYSTEM_TYPES.ALL)
    let numStars = type.numStars
    let numPlanets = rndUtil.numBetween(0, 8+4*dictUtil.getIndexRatio(metallicity))
    return {age, metallicity, type, numPlanets, numStars}
  }
}

class starGenerator {
  static genStars(systemAttributes) {
    let stars = []
    let numPlanetWeights = arrUtil.fillArray(systemAttributes.numStars,()=>Math.random())
    let numPlanetsByStarIndex = numUtil.forceTotal(numPlanetWeights, systemAttributes.numPlanets ) 
    //console.log('num planets total vs per star:',system.numPlanets,numPlanetWeights,numPlanetsByStarIndex)
    for (let i = 0; i < system.numStars; i++) stars.push(starGenerator.genStar(systemAttributes, numPlanetsByStarIndex[i]))
    for (let star of stars) orbitGenerator.assignOrbit(star, stars)
    return stars
  }
  static genStar(systemAttributes, numPlanets = 1) {
    let validTypes = STAR_TYPES.ALL.filter(starType=>{
      if (!starType.ageRange.includes(systemAttributes.age)) return false
      return true
    })
    let type = dictUtil.memberOfWeighted(validTypes)
    let features = []
    let properties = {type, features}
    properties.planets = planetGenerator.genPlanets(systemAttributes, properties, numPlanets)
    return new Star(properties)
  }
}

var numPlanetsEver = 0
class planetGenerator {
  static genPlanets(systemAttributes, star, numPlanets = 1) {
    let planets = []
    for (let i = 0; i < numPlanets; i++) planets.push(planetGenerator.genPlanet(systemAttributes, star))
    return planets
  }
  static genPlanet(systemAttributes, star) {
    let properties = {orbit, type, features}
    properties.orbit = orbitGenerator.genOrbit(properties, star)
    properties.moons = moonGenerator.genMoons(systemAttributes, properties)
    return new Planet(properties)
  }
}

class moonGenerator {
  static genMoons(systemAttributes, planet) {
    let moons = []
    let numMoons = rndUtil.numBetweenSqrt(0,4 * planet.mass * 333030,true,true)
    for (let i = 0; i < numMoons; i++) moons.push(planetGenerator.genPlanet(systemAttributes, planet, true))
    return moons
  }
}