
class orbitGenerator {
  static genOrbit(object, possibleCenters = [], compareMasses = false) {
    let objMass = 0
    if (object.type && object.type.mass) objMass = object.type.mass
    else if (object.mass) objMass = object.mass
    if (compareMasses) possibleCenters = possibleCenters.filter(center=>{
      let centerMass = center.mass || center.type.mass || Infinity
      return rangeUtil.isBefore(objMass, centerMass, true)
    })
    let center = rndUtil.memberOf(possibleCenters)
    let proximityRatio = Math.random()
    let proximity = rangeUtil.getEntryAtRatio(PROXIMITIES, proximityRatio)
    return new Orbit({center, proximity, proximityRatio})
  }
  static assignOrbit(object, possibleCenters = [], compareMasses = false) {
    let orbit = orbitGenerator.genOrbit(object, possibleCenters, compareMasses)
    object.parent = orbit.center
    object.proximity = orbit.proximity
    return orbit
  }
}

class starClusterGenerator {
  static genStarCluster() {
    let name = 'Cluster Alpha'
    let description = 'Main'
    let id = 0
    let properties = {name, description, id}
    properties.systems = systemGenerator.genSystems(properties)
    let starCluster = new StarCluster(properties)
    return starCluster
  }
}

class systemGenerator {
  static genSystems(starCluster) {
    let systems = []
    let numSystems = rndUtil.numBetweenSqrt(100,300,true)
    for (let i = 0; i < numSystems; i++) systems.push(systemGenerator.genSystem(starCluster, i))
    return systems
  }
  static genSystem(starCluster, index = 0) {
    let properties = systemGenerator.genSystemAttributes(starCluster)
    properties.id = index
    properties.name = `System ${properties.id}`
    properties.stars = starGenerator.genStars(properties)
    properties.description = properties.stars.map(star=>star.description).join('')
    return new StarSystem(properties)
  }
  static genSystemAttributes(starCluster) {
    let population = listUtil.rndEntryOfWeighted(SYSTEM_POPULATIONS) || SYSTEM_POPULATIONS.POPULATION_I
    let age = rndUtil.memberOf(population.ageRange)
    let metallicity = rndUtil.memberOf(population.metallicityRange)
    let type = listUtil.rndEntryOfWeighted(SYSTEM_TYPES)
    let numStars = type.numStars
    let numPlanets = rndUtil.numBetween(0, 8+16*rangeUtil.getEntryRatio(metallicity,true))
    return {age, metallicity, type, numPlanets, numStars}
  }
}

class starGenerator {
  static genStars(system) {
    let stars = []
    let numPlanetWeights = arrUtil.fillArray(system.numStars,()=>Math.random())
    let numPlanetsByStarIndex = numUtil.forceTotal(numPlanetWeights, system.numPlanets ) 
    //console.log('num planets total vs per star:',system.numPlanets,numPlanetWeights,numPlanetsByStarIndex)
    for (let i = 0; i < system.numStars; i++) stars.push(starGenerator.genStar(system, numPlanetsByStarIndex[i], i))
    rangeUtil.sortObjsByProperty(stars, ['mass','index'], true)
    let barycenter = stars[0]
    let otherStars = stars.slice(1)
    for (let star of otherStars) orbitGenerator.assignOrbit(star, stars, true)
    return stars
  }
  static genStar(system, numPlanets = 1, index = 0) {
    let validTypes = STAR_TYPES.ALL.filter(starType=>{
      if (!starType.ageRange.includes(system.age)) return false
      return true
    })
    let id = index
    let name = `Star ${system.id}-${id}`
    let type = listUtil.rndEntryOfWeighted(validTypes)
    let numFeatures = rndUtil.numBetweenSqrt(0,3,true,false)
    let features = rndUtil.nonRepeatingEntries(STAR_FEATURES.ALL, numFeatures)
    let {mass,luminosity,radius,radiation} = type
    let chemicalAbundances = new Map()
    let description = type.symbol
    for (let chemical of CHEMICALS.ALL) chemicalAbundances.set(chemical, Math.pow(chemical.weight, 1-Math.random()*Math.random()) )
    let properties = {type, description, features, id, name, mass, luminosity, radiation, radius, chemicalAbundances}
    properties.planets = planetGenerator.genPlanets(system, properties, numPlanets)
    return new Star(properties)
  }
}


class planetCoreGenerator {
  static getPreconditions(system, star, proximityRatio) {
    let ageRatio = rangeUtil.getEntryRatio(system.age)
    let metallicityRatio = rangeUtil.getEntryRatio(system.metallicity)
    let ambientTempRatio = numUtil.clamp(0,1, 2*rangeUtil.getEntryRatio(star.type.luminosity)*proximityRatio )
    //console.log(proximityRatio,ageRatio,metallicityRatio,ambientTempRatio)
    return {ageRatio, metallicityRatio, ambientTempRatio}
  }
  static getAccretion(ambientTempRatio, proximityRatio, indexRatio, massModifier) {
    let chemicalTypeAmounts = new Map()
    let chemicalTypeRatios = new Map()

    let initialSeedSize = Math.random()
    let metalRatio = initialSeedSize*massModifier
    let volatileRatio = (1-ambientTempRatio/1.1)*Math.pow(1-proximityRatio,1/2)*Math.pow(metalRatio,2)
    let superVolatileRatio = (1-ambientTempRatio/1.5)*Math.pow(1-proximityRatio,2)*Math.pow(metalRatio,1/2)
    let gasRatio = (1-ambientTempRatio/2)*Math.pow(indexRatio,2)*Math.pow(metalRatio,2)

    mapUtil.setValues(chemicalTypeRatios, CHEMICAL_TYPES_METAL_TO_GAS, [metalRatio,volatileRatio,superVolatileRatio,gasRatio])
    mapUtil.mutate(chemicalTypeRatios, amt=>numUtil.clamp(0,1,amt))
    mapUtil.setValues(chemicalTypeAmounts, CHEMICAL_TYPES_METAL_TO_GAS, [metalRatio*1, volatileRatio*2, superVolatileRatio*4, gasRatio*10])
    //gasRatio = Math.pow(gasRatio,1/3) //helps create giants, but makes terrestrial planets too rare
    //volatileRatio = Math.pow(volatileRatio,1/3)
    //console.log({metalRatio,gasRatio,volatileRatio})
    return {chemicalTypeRatios, chemicalTypeAmounts, initialSeedSize}
  }
  static getRotation(proximityRatio, totalMassRatio, radiusRatio) {
    let dayLengthRatio = numUtil.clamp(0,1,2*Math.pow( (0.1+proximityRatio)*Math.max(0,1.1-radiusRatio),1/2 ))
    let dayLength = rangeUtil.getEntryAtRatio(DAY_LENGTHS, dayLengthRatio)
    let tiltRatio = Math.random()
    let axialTilt = rangeUtil.getEntryAtRatio(TILTS, tiltRatio)
    //console.log({proximityRatio,totalMassRatio,radiusRatio,dayLengthRatio,dayLength})
    return {dayLengthRatio, dayLength, tiltRatio, axialTilt}
  }
  static getCoreEnergy(chemicalTypeAmounts, metallicityRatio, totalMassRatio, ageRatio, dayLengthRatio) {
    let metalAmount = chemicalTypeAmounts.get(CHEMICAL_TYPES.METAL)
    let formationHeatRatio = 2 * Math.pow(totalMassRatio, 2) * (1-ageRatio)
    let nuclearHeatRatio = (0.5 + 0.5*metallicityRatio) * metalAmount * Math.pow(1-ageRatio,1/2)
    let internalHeatRatio = numUtil.clamp(0,1, formationHeatRatio+nuclearHeatRatio)
    //console.log({metallicityRatio,totalMassRatio,ageRatio},'internal heat ratio',internalHeatRatio)
    let geologicalActivity = rangeUtil.getEntryAtRatio(GEOLOGICAL_ACTIVITY_LEVELS, internalHeatRatio) //broken
    let magnetosphereRatio = numUtil.clamp( 0,1,2*(1-dayLengthRatio)*internalHeatRatio )
    let magnetosphere = rangeUtil.getEntryAtRatio(MAGNETIC_FIELD_LEVELS, magnetosphereRatio) //broken
    //console.log({internalHeatRatio,dayLengthRatio,magnetosphere,magnetosphereRatio})
    return {internalHeatRatio, geologicalActivity, magnetosphere, magnetosphereRatio}
  }
  static getCoreData(system, star, proximityRatio, indexRatio = 0, massModifier = 1) {
    let {ageRatio, metallicityRatio, ambientTempRatio} = planetCoreGenerator.getPreconditions(system, star, proximityRatio)
    let {chemicalTypeAmounts, chemicalTypeRatios, initialSeedSize} = planetCoreGenerator.getAccretion(ambientTempRatio, proximityRatio, indexRatio, massModifier)
    let {totalMass, totalMassRatio, radiusRatio, mass, radius, gravity, gravityRatio} = planetCalc.calcSize(chemicalTypeAmounts)
    let {dayLengthRatio, dayLength, tiltRatio, axialTilt} = planetCoreGenerator.getRotation(proximityRatio, totalMassRatio, radiusRatio)
    let {internalHeatRatio, geologicalActivity, magnetosphere, magnetosphereRatio} = planetCoreGenerator.getCoreEnergy(chemicalTypeAmounts, metallicityRatio, totalMassRatio, ageRatio, dayLengthRatio)
    return {ageRatio, metallicityRatio, ambientTempRatio, chemicalTypeRatios, chemicalTypeAmounts, totalMass, totalMassRatio, radiusRatio, mass, radius,
    gravity, gravityRatio, dayLengthRatio, dayLength, tiltRatio, axialTilt, internalHeatRatio, geologicalActivity, magnetosphere, magnetosphereRatio, initialSeedSize}
  }
}

class geosphereGenerator {
  static getChemicalState(chemical, timePeriod, depth, massRatio, gravityRatio, atmosphericPressureRatio, ambientTempRatio, tempRatios, internalHeatRatio) {
    let gms = (chemical,temperatureRatio,pressureRatio)=>{
      let result = chemicalCalc.calcMatterState(chemical, temperatureRatio, pressureRatio)
      //console.log({chemical,temperatureRatio,pressureRatio,result})
      //if (Math.random() > .999) throw new Error('stopping here')
      return result
    }
    let gmsCore = (chemical)=>{
      //console.log('core',{massRatio,gravityRatio,atmosphericPressureRatio,ambientTempRatio,internalHeatRatio})
      let state = gms(chemical, internalHeatRatio*4, Math.pow(atmosphericPressureRatio+massRatio*2,1))
      if (!GEOSPHERE_DEPTHS.INNER.matterStates.includes(state)) return undefined
      return state
    }
    let gmsInner = (chemical)=>{
      //console.log('inner',{massRatio,gravityRatio,atmosphericPressureRatio,ambientTempRatio,internalHeatRatio})
      let state = gms(chemical, internalHeatRatio*2, Math.pow((atmosphericPressureRatio+massRatio*2)/2,1))
      if (!GEOSPHERE_DEPTHS.INNER.matterStates.includes(state)) return undefined
      return state
    }
    let gmsSurface = (chemical, timePeriod)=>{
      //console.log('surface',{massRatio,gravityRatio,atmosphericPressureRatio,ambientTempRatio,internalHeatRatio})
      let state = gms(chemical, tempRatios.get(timePeriod), Math.pow((atmosphericPressureRatio+gravityRatio)/2,1))
      if (!GEOSPHERE_DEPTHS.SURFACE.matterStates.includes(state)) return undefined
      return state
    }
    let gmsOuter = (chemical)=>{
      //console.log('outer',{massRatio,gravityRatio,atmosphericPressureRatio,ambientTempRatio,internalHeatRatio})
      //console.log(atmosphericPressureRatio*(ambientTempRatio+internalHeatRatio),'vs',Math.pow(massRatio,1/2))
      let state = gms(chemical, atmosphericPressureRatio*(ambientTempRatio+internalHeatRatio), Math.pow((atmosphericPressureRatio+massRatio)/3,1))
      if (!GEOSPHERE_DEPTHS.OUTER.matterStates.includes(state)) return undefined
      return state
    }
    switch (depth) {
      case GEOSPHERE_DEPTHS.CORE: return gmsCore(chemical)
      case GEOSPHERE_DEPTHS.INNER: return gmsInner(chemical)
      case GEOSPHERE_DEPTHS.SURFACE: return gmsSurface(chemical, timePeriod)
      case GEOSPHERE_DEPTHS.OUTER: return gmsOuter(chemical)
    }
  }
  static getChemicalAbundances(star, chemicalTypeAmounts) {
    let chemicalAbundances = new Map()
    for (let [chemical,abundance] of star.chemicalAbundances) chemicalAbundances.set(chemical, abundance*chemicalTypeAmounts.get(chemical.type))
    return chemicalAbundances
  }
  static getChemicalStates(massRatio, gravityRatio, atmosphericPressure, atmosphericPressureRatio, ambientTempRatio, internalHeatRatio, tempRatios) {
    //factored in gravity compressing substances. needs testing
    let noAtmosphere = (atmosphericPressure == PRESSURES.VACUUM)
    let hottestSurfaceTempRatio = tempRatios.get(PLANET_TIME_PERIODS.SUMMER_DAY)
    let gcs = (chemical, timePeriod, depth) => geosphereGenerator.getChemicalState(chemical, timePeriod, depth, massRatio, gravityRatio, atmosphericPressureRatio, ambientTempRatio, tempRatios, internalHeatRatio)
    let chemicalStates = new Map()
    for (let chemical of CHEMICALS.ALL) {
      let isGasEver = false
      for (let timePeriod of PLANET_TIME_PERIODS.ALL) {
        for (let depth of GEOSPHERE_DEPTHS.ALL) {
          let state = gcs(chemical,timePeriod,depth)
          if (!state) continue
          mapUtil.multiKeySet(chemicalStates, [timePeriod,depth,chemical], state)
          //console.log({chemical,timePeriod,depth,state})
          //if (state.gas)  console.log(state)
          if (state.gas) isGasEver = true
        }
      }
      if (isGasEver && (noAtmosphere || (Math.pow(chemical.molecularWeight,1/2) < 0.2*Math.pow(hottestSurfaceTempRatio,1/4)/massRatio))) {
        let surfaceLayerKeys = mapUtil.getKeysContaining(chemicalStates, [GEOSPHERE_DEPTHS.SURFACE, GEOSPHERE_DEPTHS.OUTER])
        mapUtil.deleteKeysContaining(chemicalStates, [chemical], surfaceLayerKeys)
        //if (surfaceLayerKeys.length > 0) console.log('removing chemical due to atmospheric escape:',chemical,surfaceLayerKeys,chemicalStates,Math.random() > .99 ? function(){throw new Error('stopping here')}() : '')
      }
    }
    return chemicalStates
  }
  static getSurfaces(geosphere = new Geosphere()) {
    //console.log('chemical states:',chemicalStates)
    let {chemicalStates} = geosphere
    let surfaces = PLANET_SURFACES.ALL.filter(surface=>{
      for (let [[timePeriod,depth,chemical], matterState] of chemicalStates) {
        if (!surface.chemicals.includes(chemical)) return false
        if (!surface.matterStates.includes(matterState)) return false
        if (surface.layer !== geosphere.getChemicalLayer(chemical)) return false
        return true
      }
    })
    return surfaces
  }
  static getSurfacesCombined(geospheres = new Map()) {
    let timePeriodsBySurface = new Map()
    let surfaces = []
    for (let surface of PLANET_SURFACES.ALL) timePeriodsBySurface.set(surface, [])
    for (let [timePeriod,geosphere] of geospheres) {
      for (let surface of geosphere.surfaces) timePeriodsBySurface.get(surface).push(timePeriod)
    }
    for (let [surface,timePeriods] of timePeriodsBySurface) if (timePeriods.length > 0) surfaces.push([surface, timeCalc.calcTimePeriodGroup(timePeriods)])
    return surfaces
  }
  static getGeospheres(chemicalStates = new Map(), type) {
    let geospheres = new Map()
    for (let timePeriod of PLANET_TIME_PERIODS.ALL) geospheres.set(timePeriod, new Geosphere())
    for (let [[timePeriod,depth,chemical],matterState] of chemicalStates) {
      let geosphere = geospheres.get(timePeriod)
      let layer = geosphereCalc.calcLayer(chemical, matterState, depth)
      if (!type.layers.includes(layer)) continue
      if (layer) geosphere.layers.get(layer).push([chemical,matterState])
    }
    for (let timePeriod of PLANET_TIME_PERIODS.ALL) {
      let geosphere = geospheres.get(timePeriod)
      geosphere.surfaces = geosphereGenerator.getSurfaces(geosphere)
    }
    return geospheres
  }
  static getGeospheresCombined(geospheres = new Map()) {
    let result = new Geosphere()
    let timePeriodsByChemicalState = new Map()
    for (let [timePeriod, geosphere] of geospheres) {
      for (let [layer,chemicalStates] of geosphere.layers) {
        for (let [chemical,matterState] of chemicalStates) {
          if (mapUtil.multiKeyGet(timePeriodsByChemicalState, [layer,chemical,matterState]) == undefined) {
            mapUtil.multiKeySet(timePeriodsByChemicalState, [layer,chemical,matterState], [])
          }
          mapUtil.multiKeyGet(timePeriodsByChemicalState, [layer,chemical,matterState]).push(timePeriod)
        }
      }
    }
    for (let [[layer,chemical,matterState],timePeriods] of timePeriodsByChemicalState) {
      let timePeriodGroup = timeCalc.calcTimePeriodGroup(timePeriods)
      result.layers.get(layer).push([chemical,matterState,timePeriodGroup])
    }
    return result
  }
  static pruneGeosphere(geosphere, geospheres, chemicalAbundances) {
    function isChemicalRemovable(chemical) {
      for (let [layer,chemicalStates] of geosphere.layers) {
        let chemicals = []
        for (let [chemical,matterState,timePeriodGroup] of chemicalStates) chemicals.push(chemical)
        if (chemicals.length == 1 && chemicals[0] == chemical) return false //dont remove a chemical when it would cause a layer to become empty
      }
      return true
    }
    function pickChemicalToRemove(chemicals) {
      let weights = chemicals.map(c=>(1/chemicalAbundances.get(c)))
      if (numUtil.getTotal(weights) == 0) return undefined
      let chemical = rndUtil.memberOfWeighted(chemicals, weights)
      return chemical
    }
    //first, try to remove chemicals from ALL layers simultaneously
    let maxNumChemicalsPerLayer = new Map(GEOSPHERE_LAYERS.ALL.map(layer=>[layer,rndUtil.numBetween(1,2)]))

    for (let [layer,chemicalStates] of geosphere.layers) {
      let maxNumChemicals = maxNumChemicalsPerLayer.get(layer)
      let chemicals = []
      for (let [chemical,matterState,timePeriodGroup] of chemicalStates) arrUtil.safeAdd(chemicals, chemical)
      let removableChemicals = [...chemicals]
      chemicalLoop: while (chemicals.length > maxNumChemicals && removableChemicals.length > 0) {
        removableChemicals = removableChemicals.filter(c=>isChemicalRemovable(c))
        let chemical = pickChemicalToRemove(removableChemicals)
        if (!chemical) break chemicalLoop
        arrUtil.safeRemove(removableChemicals, chemical)
        arrUtil.safeRemove(chemicals, chemical)
        for (let [layer,chemicalStates2] of geosphere.layers) arrUtil.removeEntriesContaining(chemicalStates2, chemical)
        //console.log('removed chemical wholesale:',chemical)
      }
      //next, try to remove chemicals from one layer at a time
      while (chemicals.length > maxNumChemicals) {
        let chemical = pickChemicalToRemove(chemicals)
        if (!chemical) break
        arrUtil.safeRemove(chemicals, chemical)
        arrUtil.removeEntriesContaining(chemicalStates, chemical)
        //console.log('removed chemical singular:',chemical)
      }
    }
    /*
    for (let [type,chemicals] of validChemicalsByType) {
      let maxNumChemicals = rndUtil.numBetween(1,2)
      chemicalLoop: while (chemicals.length > maxNumChemicals) {
        let weights = chemicals.map(c=>(1-chemicalAbundances.get(c)))
        if (numUtil.getTotal(weights) == 0) break chemicalLoop//means the remaining chemicals are 'mandatory if possible' ie hydrogen, helium
        let chemical = rndUtil.memberOfWeighted(chemicals, weights)
        arrUtil.safeRemove(chemicals, chemical)
      }
    }
    */
  }
  static getTransitions(geospheres = new Map()) {
    let chemicals = []
    for (let [timePeriod,geosphere] of geospheres) {
      let chems = geosphere.getChemicals()
      for (let chem of chems) arrUtil.safeAdd(chemicals, chem)
    }
    let transitions = []
    for (let chemical of chemicals) {
      let chemicalTransitions = geosphereGenerator.getChemicalTransitions(geospheres, chemical)
      transitions = transitions.concat(chemicalTransitions)
    }
    return transitions
  }
  static getChemicalTransitions(geospheres = new Map(), chemical) {
    function genTransition(chemical, colderLayer, hotterLayer, interval) {
      let type = geosphereCalc.calcTransitionType(colderLayer, hotterLayer)
      //let interval = timeCalc.calcInterval(startTimePeriod, endTimePeriod)
      return new GeosphereTransition({type, chemical, interval})
    }
    let summerDay = geospheres.get(PLANET_TIME_PERIODS.SUMMER_DAY).getChemicalLayer(chemical)
    let summerNight = geospheres.get(PLANET_TIME_PERIODS.SUMMER_NIGHT).getChemicalLayer(chemical)
    let winterDay = geospheres.get(PLANET_TIME_PERIODS.WINTER_DAY).getChemicalLayer(chemical)
    let winterNight = geospheres.get(PLANET_TIME_PERIODS.WINTER_NIGHT).getChemicalLayer(chemical)
    let transitions = []
    if (winterNight != summerNight) transitions.push(genTransition(chemical, winterNight, summerNight, PLANET_TIME_INTERVALS.WINTER_TO_SUMMER))
    if (summerDay == winterDay && summerNight == winterNight && summerDay != summerNight) transitions.push(genTransition(chemical, summerNight, summerDay, PLANET_TIME_INTERVALS.NIGHT_TO_DAY))
    else {
      if (winterNight != winterDay) transitions.push(genTransition(chemical, winterNight, winterDay, PLANET_TIME_INTERVALS.WINTER_NIGHT_TO_DAY))
      if (summerNight != summerDay) transitions.push(genTransition(chemical, summerNight, summerDay, PLANET_TIME_INTERVALS.SUMMER_NIGHT_TO_DAY))
    }
    return transitions
  }
  static getGeosphereData(star, type, massRatio, gravityRatio, ambientTempRatio, internalHeatRatio, tempRatios, atmosphericPressure, atmosphericPressureRatio, chemicalTypeAmounts) {
    let chemicalAbundances = geosphereGenerator.getChemicalAbundances(star, chemicalTypeAmounts)
    let chemicalStates = geosphereGenerator.getChemicalStates(massRatio, gravityRatio, atmosphericPressure, atmosphericPressureRatio, ambientTempRatio, internalHeatRatio, tempRatios)
    let geospheres = geosphereGenerator.getGeospheres(chemicalStates, type)
    let transitions = geosphereGenerator.getTransitions(geospheres)
    let surfaces = geosphereGenerator.getSurfacesCombined(geospheres)
    let geosphere = geosphereGenerator.getGeospheresCombined(geospheres)
    geosphereGenerator.pruneGeosphere(geosphere, geospheres, chemicalAbundances)
    geosphereGenerator.sanityTest(type, chemicalStates, geospheres, transitions, surfaces, geosphere)
    return {chemicalStates, geospheres, transitions, surfaces, geosphere}
  }
  static sanityTest(type, chemicalStates, geospheres, transitions, surfaces, geosphere) {
    let errors = []
    function getDataForChemical(chemical) {
      let layers = []
      let TPGs = []
      for (let [layer,chemicalStates] of geosphere.layers) {
        for (let [chemical1,matterState,timePeriodGroup] of chemicalStates) {
          if (chemical1 == chemical) {
            layers.push(layer)
            TPGs.push(timePeriodGroup)
          }
        }
      }
      return [layers, TPGs]
    }
    for (let chemical of CHEMICALS.ALL) {
      let [layers,TPGs] = getDataForChemical(chemical)
      let allAlways = true
      for (let tpg of TPGs) if (tpg !== PLANET_TIME_PERIOD_GROUPS.ALWAYS) allAlways = false
      if (allAlways) continue
      if (layers.length == 1) errors.push('planet had a chemical present in only one layer with a time period group (other than always) associated, indicating lack of transition '+chemical.name)
    }

    console.log(geosphere.layers)
    if (type.terrestrial) {
      if (!geosphere.layers.has(GEOSPHERE_LAYERS.CORE) || geosphere.layers.get(GEOSPHERE_LAYERS.CORE).length == 0) errors.push('no entries in core layer')
      if (!geosphere.layers.has(GEOSPHERE_LAYERS.MANTLE) || geosphere.layers.get(GEOSPHERE_LAYERS.MANTLE).length == 0) errors.push('no entries in mantle layer')
    } 
    else {
      if (!geosphere.layers.has(GEOSPHERE_LAYERS.GAS_CORE) || geosphere.layers.get(GEOSPHERE_LAYERS.GAS_CORE).length == 0) errors.push('no entries in gas core layer')
      if (!geosphere.layers.has(GEOSPHERE_LAYERS.MANTLE) || geosphere.layers.get(GEOSPHERE_LAYERS.GAS_MANTLE).length == 0) errors.push('no entries in gas mantle layer')
      if (!geosphere.layers.has(GEOSPHERE_LAYERS.ATMOSPHERE) || geosphere.layers.get(GEOSPHERE_LAYERS.ATMOSPHERE).length == 0) errors.push('no entries in atmosphere layer for gas giant')
    }
    if (errors.length > 0) {
      console.log('Errors:',errors)
      console.log({type,chemicalStates,geospheres,transitions,surfaces,geosphere})
      throw new Error('ERROR!')
    }
  }
}

class biomeGenerator {
  static getBioChemistry(geospheres) {
    let possibleBioChemistries = []
    for (let [timePeriod,geosphere] of geospheres) {
      let bioChemistry = biomeGenerator.getBioChemistryForGeosphere(geosphere)
      if (bioChemistry) possibleBioChemistries.push(bioChemistry)
    }
    if (possibleBioChemistries.length == 0) return undefined
    return rndUtil.memberOf(possibleBioChemistries)
  }
  static getBioChemistryForGeosphere(geosphere) {
    let {chemicalStates} = geosphere
    //console.log({geosphere,chemicalStates})
    let viableEnergySources = [ENERGY_SOURCES.CHEMICAL]
    let energySource = rndUtil.memberOf(viableEnergySources)
    let possibleTypeConfigurations = []
    for (let type of BIO_CHEMISTRY_TYPES.ALL) {
      let {bases, solvents} = type
      let viableBases = []
      let viableSolvents = []
      for (let base of bases) for (let [chemical, matterState] of chemicalStates) if (chemical == base && (matterState.solid || matterState.liquid)) viableBases.push([chemical, matterState])
      for (let solvent of solvents) for (let [chemical, matterState] of chemicalStates) if (chemical == solvent && (matterState.liquid)) viableSolvents.push([chemical, matterState])
      if (viableBases.length == 0 || viableSolvents.length == 0) continue
      let base = rndUtil.memberOf(viableBases)
      let solvent = rndUtil.memberOf(viableSolvents)
      possibleTypeConfigurations.push({type, base, solvent})
    }
    if (possibleTypeConfigurations.length == 0) return undefined
    let typeConfiguration = rndUtil.memberOf(possibleTypeConfigurations)
    let bioChemistry = new BioChemistry({...typeConfiguration, energySource})
    return {bioChemistry}
  }
}

class planetGenerator {
  static genPlanets(system, star, numPlanets = 1) {
    let planets = []
    for (let i = 0; i < numPlanets; i++) planets.push( planetGenerator.genPlanet(system, star, (i+1)/numPlanets, i) )
    rangeUtil.sortObjsByProperty(planets, ['orbit','proximity','index'], true)
    return planets
  }
  static getAtmosphereStats(star, proximityRatio, chemicalTypeAmounts, gravityRatio, magnetosphereRatio) {
    let {gasAmount} = planetGenerator.deconstructAmounts(chemicalTypeAmounts)
    let atmosphericPressureRatio = numUtil.clamp(0,1, Math.pow(3*gasAmount*gravityRatio,1/2) )
    let atmosphericPressure = rangeUtil.getEntryAtRatio(PRESSURES, atmosphericPressureRatio)
    let starRadiationRatio = rangeUtil.getEntryAtRatio(RADIATION_LEVELS, star.radiation)*proximityRatio
    let radiationRatio = numUtil.clamp(0,1,1.25*starRadiationRatio*(1-magnetosphereRatio)/(1+Math.pow(gasAmount,1/2)))
    let radiation = rangeUtil.getEntryAtRatio(RADIATION_LEVELS, radiationRatio) //internal planetary nuclear material doesnt seem to be a large factor here
    //console.log(gasRatio,magnetosphereRatio,gravityRatio,atmosphericPressureRatio,atmosphericPressure)
    return {atmosphericPressure, atmosphericPressureRatio, radiationRatio, radiation}
  }
  static getTemperatures(internalHeatRatio, ambientTempRatio, tiltRatio, dayLengthRatio) {
    //console.log({internalHeatRatio,ambientTempRatio,atmosphericPressureRatio})
    function getTempRatioAndTemp(ratio) {
      let tempRatio = numUtil.clamp(0,1,ratio)
      let temperature = rangeUtil.getEntryAtRatio(TEMPERATURES, tempRatio)
      return [tempRatio, temperature]
    }
    let temperatures = new Map()
    let tempRatios = new Map()
    let timePeriodsAndATMods = [ [PLANET_TIME_PERIODS.SUMMER_DAY, 1], [PLANET_TIME_PERIODS.SUMMER_NIGHT, 1-dayLengthRatio], [PLANET_TIME_PERIODS.WINTER_DAY, 1-tiltRatio], [PLANET_TIME_PERIODS.WINTER_NIGHT, (1-dayLengthRatio)*(1-tiltRatio)]]
    for (let [timePeriod,atMod] of timePeriodsAndATMods) {
      let ratio = internalHeatRatio + ambientTempRatio*atMod
      let [tempRatio,temperature] = getTempRatioAndTemp(ratio)
      temperatures.set(timePeriod, temperature)
      tempRatios.set(timePeriod, tempRatio)
    }
    return {temperatures, tempRatios}
  }
  static deconstructAmounts(chemicalAmounts) {
    let [metalAmount,volatileAmount,superVolatileAmount,gasAmount] = mapUtil.getEntries(chemicalAmounts, CHEMICAL_TYPES_METAL_TO_GAS)
    return {gasAmount, superVolatileAmount, volatileAmount, metalAmount}
  }
  static getPostErosionSize(magnetosphereRatio, ageRatio, chemicalAmounts) {
    let {gasAmount, superVolatileAmount, volatileAmount, metalAmount} = planetGenerator.deconstructAmounts(chemicalAmounts)
    let volatileReduction = Math.max(0,0.5-magnetosphereRatio)*ageRatio*volatileAmount
    let superVolatileReduction = Math.max(0,0.66-magnetosphereRatio)*ageRatio*superVolatileAmount
    let gasReduction = Math.max(0,0.75-magnetosphereRatio)*ageRatio*gasAmount
    mapUtil.modifyEntry(chemicalAmounts, CHEMICAL_TYPES.GAS, amt=>amt-gasReduction)
    mapUtil.modifyEntry(chemicalAmounts, CHEMICAL_TYPES.SUPER_VOLATILE, amt=>amt-superVolatileReduction)
    mapUtil.modifyEntry(chemicalAmounts, CHEMICAL_TYPES.VOLATILE, amt=>amt-volatileReduction)
    //if (iceReduction || gasReduction) console.log('ice,gas reduction:',iceReduction,gasReduction,'as percents:',iceReduction/volatileAmount,gasReduction/gasAmount,'age,magnet ratio:',ageRatio,magnetosphereRatio)
    return planetCalc.calcSize(chemicalAmounts)
  }
  static getType(mass, chemicalAmounts = new Map()) {
    let {gasAmount, superVolatileAmount, volatileAmount, metalAmount} = planetGenerator.deconstructAmounts(chemicalAmounts)
    let isGiant = rangeUtil.isAfter(mass, MASSES.HEAVY, true)
    let type = undefined
    if (metalAmount > volatileAmount && metalAmount > gasAmount) type = isGiant ? PLANET_TYPES.TERRESTRIAL_GIANT : PLANET_TYPES.TERRESTRIAL_DWARF
    else if (volatileAmount > gasAmount) type = isGiant ? PLANET_TYPES.ICE_GIANT : PLANET_TYPES.ICE_DWARF
    else type = isGiant ? PLANET_TYPES.GAS_GIANT : PLANET_TYPES.GAS_DWARF
    return type
  }
  static getProperties(system, star, proximityRatio, indexRatio = 0, massModifier = 1) {
    let {ageRatio, metallicityRatio, ambientTempRatio, chemicalTypeRatios, chemicalTypeAmounts, totalMass, totalMassRatio, radiusRatio, mass, radius,
    gravity, gravityRatio, dayLengthRatio, dayLength, tiltRatio, axialTilt, internalHeatRatio, geologicalActivity, magnetosphere, magnetosphereRatio, initialSeedSize} = planetCoreGenerator.getCoreData(system, star, proximityRatio, indexRatio, massModifier)
    //console.log(mass)
    let newSize = planetGenerator.getPostErosionSize(magnetosphereRatio, ageRatio, chemicalTypeAmounts)
    mass = newSize.mass; radius = newSize.radius; gravity = newSize.gravity
    let {temperatures, tempRatios} = planetGenerator.getTemperatures(internalHeatRatio, ambientTempRatio, tiltRatio, dayLengthRatio)
    let {atmosphericPressure, atmosphericPressureRatio, radiation, radiationRatio} = planetGenerator.getAtmosphereStats(star, proximityRatio, chemicalTypeAmounts, gravityRatio, magnetosphereRatio)
    let type = planetGenerator.getType(mass, chemicalTypeAmounts)
    let {chemicalStates, geospheres, transitions, surfaces, geosphere} = geosphereGenerator.getGeosphereData(star, type, totalMassRatio, gravityRatio, ambientTempRatio, internalHeatRatio, tempRatios, atmosphericPressure, atmosphericPressureRatio, chemicalTypeAmounts)
    //let geosphere = planetGenerator.combineGeospheresFinal(geosphereDay, geosphereNight, geosphereWinter)
    //console.log({geosphereDay, geosphereNight, geosphereWinter, geosphere, surfaces, transientSurfaces, type})
    let bioChemistry = biomeGenerator.getBioChemistry(geospheres)
    let numFeatures = rndUtil.numBetweenSqrt(0,3,true,false)
    let features = rndUtil.nonRepeatingEntries(PLANET_FEATURES.ALL, numFeatures)
    let properties = {type, mass, radius, features, gravity, atmosphericPressure, temperatures, geologicalActivity, magnetosphere, dayLength, axialTilt,
    totalMassRatio, radiation, geospheres, transitions, surfaces, bioChemistry, geosphere, initialSeedSize}
    return properties
  }
  static genPlanet(system, star, indexRatio = 0, index = 0) {
    let orbit = orbitGenerator.genOrbit({}, [star])
    let properties = planetGenerator.getProperties(system, star, orbit.proximityRatio, indexRatio)
    properties.id = index
    properties.name = `Planet ${system.id}-${star.id}-${properties.id}`
    properties.orbit = orbit
    properties.moons = moonGenerator.genMoons(system, star, properties, indexRatio)
    return new Planet(properties)
  }
}

class moonGenerator {
  static genMoons(system, star, planet, indexRatio) {
    let moons = []
    let numMoons = rndUtil.numBetween(0,1+8*rangeUtil.getEntryRatio(planet.mass,true),true,false)
    for (let i = 0; i < numMoons; i++) moons.push(moonGenerator.genMoon(system, star, planet, indexRatio, i))
    rangeUtil.sortObjsByProperty(moons, ['orbit','proximity','index'], true)
    return moons
  }
  static genMoon(system, star, planet, indexRatio = 0, index = 0) {
    let massModifier = 0.5*planet.initialSeedSize
    //console.log('mass ratio cap 1:',massRatio)
    let properties = planetGenerator.getProperties(system, star, planet.orbit.proximityRatio, indexRatio, massModifier) 
    if (properties.totalMassRatio >= planet.totalMassRatio) console.log('WARNING: moon mass ratio larger than its planet:'+totalMassRatio+' '+planet.totalMassRatio)
    properties.orbit = orbitGenerator.genOrbit(properties, [planet])
    properties.id = index
    properties.name = `Moon ${system.id}-${star.id}-${planet.id}-${properties.id}`
    return new Moon(properties)
  }
}