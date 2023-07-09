
class tester {
  static test() {
    let typeCounts = new Map()
    let planetTypeCounts = new Map()
    let moonTypeCounts = new Map()
    let totalStars = 0
    let totalPlanets = 0
    let totalMoons = 0
    let starCluster = starClusterGenerator.genStarCluster()
    gs.starCluster = starCluster
    console.log('star cluster:',starCluster)
    let systems = starCluster.systems
    let totalSystems = systems.length
    let planetIDs = []
    let planetAttribKeys = []//GEOSPHERE_LAYER_NAMES
    let planetAttribMaps = new Map()
    let moonAttribMaps = new Map()
    for (let key of planetAttribKeys) {
      planetAttribMaps.set(key, new Map())
      moonAttribMaps.set(key, new Map())
    }
    for (let i = 0; i < totalSystems; i++) {
      let system = systems[i]
      //console.log('checking system:',i,system)
      let {stars,planets,moons} = system
      for (let star of stars) {
        if (!typeCounts.get(star.type)) typeCounts.set(star.type,0)
        typeCounts.set(star.type, typeCounts.get(star.type)+1)
        totalStars++
      }
      for (let planet of planets) {
        if (!planetTypeCounts.get(planet.type)) planetTypeCounts.set(planet.type,0)
        planetTypeCounts.set(planet.type, planetTypeCounts.get(planet.type)+1)
        totalPlanets++
        for (let key in planet) {
          if (!planetAttribKeys.includes(key)) continue
          let value = planet[key]
          if (value == undefined) continue
          if (Array.isArray(value)) value = value.map(a=>a.name).join(' ')
          let attribMap = planetAttribMaps.get(key)
          if (!attribMap.get(value)) attribMap.set(value,0)
          attribMap.set(value, attribMap.get(value)+1)
        }
        planetIDs.push(planet.id)
      }
      for (let moon of moons) {
        if (!moonTypeCounts.get(moon.type)) moonTypeCounts.set(moon.type,0)
        moonTypeCounts.set(moon.type, moonTypeCounts.get(moon.type)+1)
        totalMoons++
        for (let key in moon) {
          if (!planetAttribKeys.includes(key)) continue
          let value = moon[key]
          if (value == undefined) continue
          if (Array.isArray(value)) value = value.map(a=>a.name).join(' ')
          let attribMap = moonAttribMaps.get(key)
          if (!attribMap.get(value)) attribMap.set(value,0)
          attribMap.set(value, attribMap.get(value)+1)
        }
      }
    }
    console.log('SYSTEMS:')
    console.log('num systems generated:',systems.length)
    console.log('STARS:')
    for (let [type,count] of typeCounts) {
      let ratio = count/totalStars
      console.log(type.name,'ratio:',numUtil.asPercent(ratio),'count:',count)
    }    
    console.log('PLANETS:')
    console.log('num planets generated, avg per system:',totalPlanets,totalPlanets/systems.length)
    for (let [type,count] of planetTypeCounts) {
      let ratio = count/totalPlanets
      console.log(type.name,'ratio:',numUtil.asPercent(ratio),'count:',count)
    }
    for (let [key,map] of planetAttribMaps) {
      console.log('PLANETS - '+key.toUpperCase())
      let totalAssigned = 0
      for (let [type,count] of planetAttribMaps.get(key)) {
        let ratio = count/totalPlanets
        totalAssigned += count
        console.log(type.name || ''+type,'ratio:',numUtil.asPercent(ratio),'count:',count)
      }
      console.log('Unassigned ratio',numUtil.asPercent(1-totalAssigned/totalPlanets),'count:',totalPlanets-totalAssigned)
    }
    console.log('MOONS:')
    console.log('num moons generated, avg per system:',totalMoons,totalMoons/systems.length)
    for (let [type,count] of moonTypeCounts) {
      let ratio = count/totalMoons
      console.log(type.name,'ratio:',numUtil.asPercent(ratio),'count:',count)
    }
    for (let [key,map] of moonAttribMaps) {
      console.log('MOONS - '+key.toUpperCase())
      let totalAssigned = 0
      for (let [type,count] of moonAttribMaps.get(key)) {
        let ratio = count/totalMoons
        totalAssigned += count
        console.log(type.name || ''+type,'ratio:',numUtil.asPercent(ratio),'count:',count)
      }
      console.log('Unassigned ratio',numUtil.asPercent(1-totalAssigned/totalMoons),'count:',totalMoons-totalAssigned)
    }
    testMenu.start()
  }
}

class testMenu {
  static start() {
    testMenu.select(gs.starCluster)
  }
  static objToLink(obj = new AstronomicalObject) {
    temp.funcs.push(()=>testMenu.select(obj))
    return `@${obj.name}${obj.type ? ` - ${obj.description}` : ``}:::testMenu.runFunc(${temp.funcs.length-1})`
  }
  static objsToLinks(objs = []) {
    let contents = []
    for (let obj of objs) contents.push( testMenu.objToLink(obj) )
    return contents.join('\n')
  }
  static listObjPropertiesSection(obj, header, keys) {
    let container = {}
    if (obj instanceof Map) {
      let newObj = {}
      for (let [key,val] of obj) newObj[key.name] = val
      obj = newObj
    }
    if (!keys) container = obj
    else for (let key of keys) container[key] = obj[key]
    return `#${header}\n${testMenu.listObjProperties(container)}`
  }
  static listObjProperties(obj = {}, divider = '\n', noPrefix = false) {
    let contents = []
    let forbiddenKeys = ['children','parent','systems','stars','planets','moons','orbit','chemicalAbundances']
    console.log({obj,divider,noPrefix})
    for (let key in obj) {
      if (forbiddenKeys.includes(key)) continue
      let value = obj[key]
      console.log('value:',value)
      if (!value) continue
      if (value instanceof Map && value.keys().length == 0) continue
      if (Array.isArray(value) && value.length == 0) continue
      console.log(Array.isArray(value),(value && value[0]),(value[0] && value[0].name))
      let prefix = noPrefix ? '' : `${key}: `
      let text = ''
      if (value.name) {
        text = value.name
        if (value.color) text = htmlUtil.colorSpan(text, value.color)
      }
      else if (Array.isArray(value) && value[0]) text = testMenu.listObjProperties(value, ', ', true)
      else if (value instanceof Map) text = testMenu.listObjProperties(mapUtil.toObject(value), '\n', false)
      else if (typeof value === 'string' || typeof value == 'number') text = ''+value
      let content = prefix + text
      //console.log({obj,key,value,prefix,text,content})
      contents.push(content)
    }
    return contents.join(divider)
  }
  static runFunc(funcIndex = 0) {
    temp.funcs[funcIndex]()
  }
  static select(obj = new AstronomicalObject()) {
    console.log('displaying object:',obj)
    temp.funcs = []
    let content = `##${obj.name}
    ${obj.parent && obj.parent.parent && obj.parent.parent.parent ? `#3rd Parent
    ${testMenu.objToLink(obj.parent.parent.parent)}` : ``}
    ${obj.parent && obj.parent.parent ? `#2nd Parent
    ${testMenu.objToLink(obj.parent.parent)}` : ``}
    ${obj.parent ? `#Parent
    ${testMenu.objToLink(obj.parent)}` : ``}
    ${obj.parent && obj.parent.children && obj.parent.children.length > 1 ? `#Siblings
    ${testMenu.objsToLinks(arrUtil.safeRemove([...obj.parent.children], obj))}` : ``}
    ${obj.children && obj.children.length > 0 ? `#Children
    ${testMenu.objsToLinks(obj.children)}` : ``}
    `
    if (obj instanceof Planetoid) {
      content += `
      ${testMenu.listObjPropertiesSection(obj, 'Classification', ['type','mass','radius','magnetosphere'])}
      ${testMenu.listObjPropertiesSection(obj, 'Orbit', ['proximity','dayLength','axialTilt'])}
      ${testMenu.listObjPropertiesSection(obj, 'Surface', ['surfaces','gravity','atmosphericPressure','radiation','geologicalActivity'])}
      ${testMenu.listObjPropertiesSection(obj.temperatures, 'Temperatures')}
      ${testMenu.listObjPropertiesSection(obj.geosphere.layers, 'Geosphere')}
      `
    }
    else content += `${testMenu.listObjProperties(obj)}`
    ui.newPage(content)
  }
}

/*
      ${testMenu.listObjPropertiesSection(obj.geospheres.get(PLANET_TIME_PERIODS.SUMMER_DAY).layers, 'Geosphere - Summer Day')}
      ${testMenu.listObjPropertiesSection(obj.geospheres.get(PLANET_TIME_PERIODS.SUMMER_NIGHT).layers, 'Geosphere - Summer Night')}
      ${testMenu.listObjPropertiesSection(obj.geospheres.get(PLANET_TIME_PERIODS.WINTER_DAY).layers, 'Geosphere - Winter Day')}
      ${testMenu.listObjPropertiesSection(obj.geospheres.get(PLANET_TIME_PERIODS.WINTER_NIGHT).layers, 'Geosphere - Winter Night')}
*/