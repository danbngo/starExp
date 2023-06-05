
class tester {
  static test() {
    let totalMass = 0
    let typeCounts = new Map()
    let planetTypeCounts = new Map()
    let moonTypeCounts = new Map()
    let totalStars = 0
    let totalBirthMass = 0
    let maxBirthMass = 0
    let maxAge = 0
    let maxMass = 0
    let totalPlanetMass = 0
    let totalPlanetCoreMass = 0
    let minBirthMass = Infinity
    let minAge = Infinity
    let minMass = Infinity
    let totalAge = 0
    let totalPlanets = 0
    let totalMoons = 0
    let totalMoonMass = 0
    let totalMoonCoreMass = 0
    let starCluster = starClusterGenerator.genStarCluster()
    console.log('star cluster:',starCluster)
    let systems = starCluster.starSystems
    let totalSystems = systems.length
    let planetIDs = []
    for (let i = 0; i < totalSystems; i++) {
      let system = systems[i]
      console.log('checking system:',i,system)
      let {stars,planets,moons} = system
      totalAge += system.age/(14*BIL)
      if (system.age > maxAge) maxAge = system.age
      if (system.age < minAge) minAge = system.age
      for (let star of stars) {
        totalMass += star.mass
        totalBirthMass += star.birthMass
        if (star.mass > maxMass) maxMass = star.mass
        if (star.mass < minMass) minMass = star.mass
        if (star.birthMass > maxBirthMass) maxBirthMass = star.birthMass
        if (star.birthMass < minBirthMass) minBirthMass = star.birthMass
        if (!typeCounts.get(star.type)) typeCounts.set(star.type,0)
        typeCounts.set(star.type, typeCounts.get(star.type)+1)
        totalStars++
      }
      for (let planet of planets) {
        if (!planetTypeCounts.get(planet.type)) planetTypeCounts.set(planet.type,0)
        planetTypeCounts.set(planet.type, planetTypeCounts.get(planet.type)+1)
        totalPlanetMass += planet.mass
        totalPlanetCoreMass += planet.composition.metal
        totalPlanets++
        planetIDs.push(planet.id)
      }
      for (let moon of moons) {
        if (!moonTypeCounts.get(moon.type)) moonTypeCounts.set(moon.type,0)
        moonTypeCounts.set(moon.type, moonTypeCounts.get(moon.type)+1)
        totalMoonMass += moon.mass
        totalMoonCoreMass += moon.composition.metal
        totalMoons++
      }
    }
    console.log('SYSTEMS:')
    console.log('num systems generated:',systems.length)
    console.log('STARS:')
    console.log('mass range:',minMass,maxMass)
    console.log('birth mass range:',minBirthMass,maxBirthMass)
    console.log('age range:',minAge,maxAge)
    console.log('avg mass:',totalMass/totalSystems)
    console.log('avg birthmass:',totalBirthMass/totalSystems)
    console.log('avg age:',totalAge/totalSystems * 14*BIL)
    for (let [type,count] of typeCounts) {
      let ratio = count/totalStars
      console.log(type.name,'ratio:',ratio,'count:',count)
    }    
    console.log('PLANETS:')
    console.log('num planets generated, avg per system:',totalPlanets,totalPlanets/systems.length)
    console.log('avg planet core mass:',totalPlanetCoreMass/totalPlanets)
    console.log('avg planet mass:',totalPlanetMass/totalPlanets)
    for (let [type,count] of planetTypeCounts) {
      let ratio = count/totalPlanets
      console.log(type.name,'ratio:',ratio,'count:',count)
    }    
    console.log('MOONS:')
    console.log('num moons generated, avg per system:',totalMoons,totalMoons/systems.length)
    console.log('avg moon core mass:',totalMoonCoreMass/totalMoons)
    console.log('avg moon mass:',totalMoonMass/totalMoons)
    for (let [type,count] of moonTypeCounts) {
      let ratio = count/totalMoons
      console.log(type.name,'ratio:',ratio,'count:',count)
    }
  }
}