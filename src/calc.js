
class chemicalCalc {
  static calcMatterState = (chemical, temperatureRatio = 1, pressureRatio = 1)=>{
    //if (logging) console.log('calculating matter state:',chemical.name,temperatureRatio,pressureRatio,excludeGas)
    let {triplePoint,criticalPoint,solidGasSlope,liquidGasSlope,behaviorType} = chemical
    let isGradient = (behaviorType == CHEMICAL_BEHAVIOR_TYPES.GRADIENT)
    let pressureSection = pressureRatio < triplePoint[0] ? 'B' : pressureRatio > criticalPoint[0] ? 'T' : 'M'
    let tempSection = temperatureRatio < triplePoint[1] ? 'L' : temperatureRatio > criticalPoint[1] ? 'R' : 'M'
    let pressureTempSlope1 = pressureRatio/(0.000000001+temperatureRatio)
    let pressureTempSlope2 = Math.max(0,pressureRatio-triplePoint[0])/(0.000000001+Math.max(0,temperatureRatio-triplePoint[1]))
    let section = pressureSection+tempSection
    //if (logging && chemical == CHEMICALS.WATER) console.log('water preconds', {temperatureRatio,pressureRatio,pressureTempSlope1,pressureTempSlope2,section})
    let state
    switch (section) {
      case 'TL': state = MATTER_STATES.COMPRESSED_SOLID; break
      case 'TM': state = (pressureTempSlope2 > liquidGasSlope*2) ? MATTER_STATES.COMPRESSED_SOLID : MATTER_STATES.COMPRESSED_LIQUID; break
      case 'TR': state = MATTER_STATES.SUPER_CRITICAL_FLUID; break
    }
    if (!state && isGradient) switch (section) {
      case 'BL': state = (pressureTempSlope1 > solidGasSlope) ? MATTER_STATES.SUPER_COOLED_LIQUID : MATTER_STATES.SUBLIME_GAS; break
      case 'ML': state = MATTER_STATES.SUPER_COOLED_LIQUID; break

      /*case 'MM': state = (pressureTempSlope2 > liquidGasSlope) ? MATTER_STATES.LIQUID : MATTER_STATES.RAREFIED_LIQUID; break
      case 'BL': state = (pressureTempSlope1 > solidGasSlope) ? MATTER_STATES.FROZEN_SOLID : MATTER_STATES.SUPER_COOLED_LIQUID; break
      case 'BM': state = (pressureTempSlope1 > MATTER_STATES.RAREFIED_LIQUID; break //very low pressure*/
    }
    /*
    if (!state && excludeGas) switch (section) {
      case 'MM': state = (pressureTempSlope2 > liquidGasSlope) ? MATTER_STATES.LIQUID : MATTER_STATES.GRAVITIC_LIQUID; break
      case 'MR': state = MATTER_STATES.GRAVITIC_MAGMA; break
      case 'BL': state = (pressureTempSlope1 > solidGasSlope) ? MATTER_STATES.FROZEN_SOLID : MATTER_STATES.GRAVITIC_SOLID; break
      case 'BM': state = MATTER_STATES.GRAVITIC_LIQUID; break
      case 'BR': state = MATTER_STATES.GRAVITIC_MAGMA; break
    }
    */
    if (!state) switch (section) {
      case 'ML': state = MATTER_STATES.SOLID; break
      case 'MM': state = (pressureTempSlope2 > liquidGasSlope) ? MATTER_STATES.LIQUID : MATTER_STATES.VAPOR; break
      case 'MR': state = MATTER_STATES.PRESSURIZED_GAS; break
      case 'BL': state = (pressureTempSlope1 > solidGasSlope) ? MATTER_STATES.FROZEN_SOLID : MATTER_STATES.SUBLIME_GAS; break
      case 'BM': state = MATTER_STATES.GAS; break
      case 'BR': state = MATTER_STATES.HOT_GAS; break
    }
    //console.log({pressureTempSlope1,pressureTempSlope2,liquidGasSlope,solidGasSlope,state,section})
    //console.log('returning matter state for:',chemical.name,section,state)
    if (!state) throw new Error('couldnt find valid matter state')
    return state
  }
}

class geosphereCalc {
  static calcTransitionType(colderLayer, hotterLayer) {
    let type = GEOSPHERE_LAYER_TRANSITIONS.ALL.filter(type=>(type.colderLayer == colderLayer && type.hotterLayer == hotterLayer))[0]
    if (!type) {
      throw new Error('unable to find appropriate geosphere layer transition type')
    }
    return type
  }
  static calcLayer(chemical, matterState, depth = GEOSPHERE_DEPTHS.INNER) {
    for (let layer of depth.layers) {
      if (layer.chemicals.includes(chemical) && layer.matterStates.includes(matterState)) return layer
    }
    //console.log({chemical,matterState,depth})
    return undefined//throw new Error('couldnt find valid geosphere layer')
  }
}

class planetCalc {
  static calcSize(chemicalTypeAmounts = new Map()) {
    let [metalAmount,volatileAmount,superVolatileAmount,gasAmount] = mapUtil.getEntries(chemicalTypeAmounts, CHEMICAL_TYPES_METAL_TO_GAS)
    let totalMass = gasAmount + superVolatileAmount + volatileAmount + metalAmount
    let totalMassRatio = totalMass/(10+4+2+1)
    //totalMassRatio = Math.min(1,5*totalMassRatio)
    let coreRadiusRatio = 0.75*metalAmount
    let radiusRatio = (0.75*metalAmount + 0.9*volatileAmount + 1.1*superVolatileAmount + 1.25*gasAmount) / totalMass
    let mass = rangeUtil.getEntryAtRatio(MASSES, 6*totalMassRatio)
    let radius = rangeUtil.getEntryAtRatio(RADII, 6*totalMassRatio*radiusRatio)
    let gravityRatio = numUtil.clamp(0,1,Math.pow(3*totalMassRatio/Math.pow(coreRadiusRatio,1/2),1/2))
    let gravity = rangeUtil.getEntryAtRatio(GRAVITY_LEVELS, gravityRatio)
    //console.log({totalMassRatio,mass})
    //console.log({metalAmount,volatileAmount,gasAmount},totalMassRatio)
    return {totalMass, totalMassRatio, radiusRatio, mass, radius, gravityRatio, gravity}
  }
}

class timeCalc {
  static calcInterval(startTimePeriod = PLANET_TIME_PERIODS.SUMMER_DAY, endTimePeriod = PLANET_TIME_PERIODS.WINTER_NIGHT) {
    let possibleIntervals = []
    for (let interval of PLANET_TIME_INTERVALS.ALL) if (interval.startPeriods.includes(startTimePeriod) && interval.endPeriods.includes(endTimePeriod)) possibleIntervals.push(interval)
    possibleIntervals = arrUtil.sortByNumericValue(possibleIntervals, 'priority')
    return possibleIntervals[possibleIntervals.length-1]
  }
  static calcTimePeriodGroup(timePeriods = []) {
    for (let tpg of PLANET_TIME_PERIOD_GROUPS.ALL) {
      if (arrUtil.containsSameEntries(timePeriods, tpg.periods)) return tpg
    }
    console.log(timePeriods)
    throw new Error('couldnt find time period group')
    return undefined
  }
}










