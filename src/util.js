var temp = {}
console.log('temp:',temp)

class strUtil {
  static repeatStr(str = '', numRepeats = 1) {
    let result = ''
    for (let i = 0; i < numRepeats; i++) result += str
    return result
  }
}

class htmlUtil {
  static colorSpan(text = '', color = '', backgroundColor = '') {
    let style = ''
    if (Array.isArray(color)) color = colorUtil.toRGBA(color)
    if (Array.isArray(backgroundColor)) backgroundColor = colorUtil.toRGBA(backgroundColor)
    if (color && color.length > 0) style += 'color:'+color+';'
    if (backgroundColor && backgroundColor.length > 0) style += 'background-color:'+backgroundColor+';'
    style = `"${style}"`
    return `<span style=${style}>${text}</span>`
  }
}

class listUtil {
  static addAll(dict = {}, colorScheme = [ [0,0,255], [0,255,0], [255,0,0] ]) {
    let ALL = []
    for (let key in dict) {
      ALL.push(dict[key])
      dict[key].dict = dict
    }
    if (ALL[0].index !== undefined) {
      ALL = arrUtil.sortByNumericValue(ALL, 'index')
      let highestIndex = ALL.length-1
      for (let obj of ALL) {
        let color = colorUtil.getColorInSpectrum(colorScheme, obj.index/highestIndex)
        obj.color = color
        let breakPoint = highestIndex/2
        let numSymbols = 1+Math.floor(obj.index-breakPoint)
        let symbolType = obj.index == breakPoint ? '=' : obj.index > breakPoint ? '+' : '-'
        let symbol = strUtil.repeatStr(symbolType,numSymbols)
        obj.symbol = htmlUtil.colorSpan(symbol, color)
      }
    }
    dict.ALL = ALL
    return dict.ALL
  }
  static rndEntryOfWeighted(entries = []) {
    if (entries.ALL) entries = entries.ALL
    let weights = entries.map(entry=>entry.weight)
    return rndUtil.memberOfWeighted(entries, weights)
  }
  static rndEntryOf(dict = {}) {
    return rndUtil.memberOf(dict.ALL)
  }
  static getIndex(entry) {
    return entry.dict.ALL.indexOf(entry)
  }
}

class mapUtil {
  static mutate(map, mutator = (value)=>value) {
    for (let [key,value] of map) map.set(key, mutator(value))
  }
  static setValues(map, keys = [], values = []) {
    for (let i = 0; i < keys.length; i++) map.set(keys[i], values[i])
  }
  static modifyEntry(map, key = '', modifier = (value)=>value) {
    map.set(key, modifier(map.get(key)))
  }
  static getEntries(map, keys = []) {
    return keys.map(key=>map.get(key))
  }
  static getMultiKey(map, key = []) {
    for (let [key1,value] of map) {
      if (arrUtil.containsSameEntries(key1, key)) return key1
    }
    return undefined
  }
  static multiKeyGet(map, key = []) {
    key = mapUtil.getMultiKey(map, key) || key
    return map.get(key)
  }
  static multiKeySet(map, key = [], value) {
    key = mapUtil.getMultiKey(map, key) || key
    return map.set(key, value)
  }
  static multiKeyDelete(map, key = []) {
    key = mapUtil.getMultiKey(map, key) || key
    return map.delete(key)
  }
  static deleteKeysContaining(map, keyEntries, keysToInclude) {
    let keysToDelete = mapUtil.getKeysContaining(map, keyEntries, keysToInclude)
    for (let key of keysToDelete) map.delete(key)
  }
  static getKeysContaining(map, keyEntries = [], keysToInclude) {
    let keys = []
    for (let [key,value] of map) for (let keyEntry of keyEntries) if (key.includes(keyEntry)) keys.push(key)
    if (keysToInclude) keys = keys.filter(key=>keysToInclude.includes(key))
    return keys
  }
  static toObject(map) {
    let result = {}
    for (let [key,value] of map) result[(key.name || ''+key)] = value
    return result
  }
}

class colorUtil {
  static toRGBA(color = [0,0,0]) {
    return `rgba(${color[0]},${color[1]},${color[2]})`
  }
  static getColorInSpectrum(spectrum = [[0,0,0],[255,255,255]], ratio = 0) {
    let numColors = spectrum.length
    let highestIndex = numColors-1
    let startColorIndex = Math.floor(highestIndex*ratio)
    let startColorRatio = startColorIndex/highestIndex
    let endColorIndex = Math.ceil(highestIndex*ratio)
    let endColorRatio = endColorIndex/highestIndex
    let startColorGap = Math.abs(ratio-startColorRatio)
    let endColorGap = Math.abs(ratio-endColorRatio)
    let startColor = spectrum[startColorIndex]
    let endColor = spectrum[endColorIndex]
    if (startColor == endColor) return startColor
    //console.log({numColors,highestIndex,startColor,startColorRatio,endColor,endColorRatio,startColorProximity,endColorProximity,spectrum,ratio})
    //if (!startColor || !endColor) throw new Error('uh oh')
    return colorUtil.mixColors(startColor, endColor, endColorGap, startColorGap)
  }
  static mixColors(colorA = [0,0,0], colorB = [0,0,0], weightA = 1.0, weightB = 1.0) {
    let totalWeight = weightA+weightB
    weightA = weightA/totalWeight
    weightB = weightB/totalWeight
    let result = [0,1,2].map(index=>{
      return Math.round(colorA[index]*weightA + colorB[index]*weightB)
    })
    //console.log({colorA,colorB,weightA,weightB,result})
    return result
  }
}


class rangeUtil {
  static getEntryByMetric(dict = {}, metric = 1) {
    for (let obj of dict.ALL) {
      if (metric >= obj.metric[0] && metric <= obj.metric[1]) return obj
    }
    if (metric > 0) return dict.ALL[dict.ALL.length-1]
    return dict.ALL[0]
    console.log(dict,metric)
    throw new Error('could not find suitable entry based on metric')
    return undefined
  }
  static ratioToMetric(dict = {}, ratio) {
    let entry = rangeUtil.getEntryAtRatio(dict, ratio)
    let ratioBottom = entry.index/dict.ALL.length
    let ratioTop = (entry.index+1)/dict.ALL.length
    let ratioPortion = (ratio-ratioBottom)/(ratioTop-ratioBottom)
    let metricSpan = entry.metric[1]-entry.metric[0]
    return entry.metric[0]+metricSpan*ratioPortion //this value CAN go over the maximum
  }
  static getRatioByMetric(dict = {}, metric = 1) {
    let obj = rangeUtil.getEntryByMetric(dict, metric)
    let ratioTop = (metric-obj.metric[0])
    let ratioBottom = (obj.metric[1]-obj.metric[0])
    let ratio = ratioTop/ratioBottom
    let result = (obj.index+ratio)/dict.ALL.length
    //console.log({obj,index:obj.index,ratio,ratioTop,ratioBottom,threshold:obj.index+ratio,result})
    return result //this value CAN go over 1
  }
  static sortObjsByProperty(objs = [], keys = [], descending = false) {
    function getObjScore(obj) {
      for (let key of keys) obj = obj[key]
      return obj
    }
    objs.sort( (a,b)=>{
      if (descending) return getObjScore(b) - getObjScore(a)
      else return getObjScore(a) - getObjScore(b)
    })
  }
  static slice(fromEntry, toEntry) {
    let dict = fromEntry ? fromEntry.dict : toEntry.dict
    let fromEntryIndex = fromEntry ? fromEntry.index : 0
    let toEntryIndex = toEntry ? toEntry.index : dict.ALL.length-1
    //console.log('slicing:',fromEntry,toEntry,dict,fromEntryIndex,toEntryIndex)
    if (toEntryIndex < fromEntryIndex) throw new Error('from entry must be before or same as to entry in RANGE')
    return dict.ALL.slice(fromEntryIndex, toEntryIndex-1)
  }
  static getEntryRatio(entry, startAtOne = false) {
    if (startAtOne) return (1+entry.index)/entry.dict.ALL.length
    let highestIndex = entry.dict.ALL.length-1
    return entry.index/highestIndex
  }
  static getEntry(dict = {}, index = 0, safe = true) {
    if (safe) index = rangeUtil.makeIndexSafe(dict, index)
    return dict.ALL[index]
  }
  static getEntryAtRatio(dict = {}, ratio = 0.5) {
    let index = dict.ALL.length*ratio
    return rangeUtil.getEntry(dict, index)
  }
  static makeIndexSafe(dict = {}, index = 0) {
    index = Math.floor(index)
    return Math.max(0,Math.min(dict.ALL.length-1, index))
  }
  static performMath(entry1, entry2, operator = '+', safe = true) {
    let index1 = entry1.dict ? entry1.index : entry1
    let index2 = entry2.dict ? entry2.index : entry2
    let total = 0
    if (operator == '+') total = index1+index2
    else if (operator == '-') total = index1-index2
    else if (operator == '*') total = index1*index2
    else if (operator == '/') total = index1/index2
    let dict = entry1.dict
    return safe ? rangeUtil.makeIndexSafe(dict, total) : index
  }
  static add = (entry1,entry2,safe=true)=>rangeUtil.performMath(entry1,entry2,'+',safe)
  static subtract = (entry1,entry2,safe=true)=>rangeUtil.performMath(entry1,entry2,'-',safe)
  static multiply = (entry1,entry2,safe=true)=>rangeUtil.performMath(entry1,entry2,'*',safe)
  static divide = (entry1,entry2,safe=true)=>rangeUtil.performMath(entry1,entry2,'/',safe)
  static from(fromEntry) {
    return rangeUtil.slice(fromEntry, undefined)
  }
  static to(toEntry) {
    return rangeUtil.slice(undefined, toEntry)
  }
  static compare(entry, againstEntry, comparator = '>=') {
    let entryIndex = entry.index || entry
    let againstIndex = againstEntry.index || againstEntry
    if (comparator.includes('=') && entryIndex == againstIndex) return true
    if (comparator.includes('>') && entryIndex > againstIndex) return true
    if (comparator.includes('<') && entryIndex < againstIndex) return true
    return false
  }
  static isAfter = (entry, againstEntry, orEquals = false)=>rangeUtil.compare(entry, againstEntry, orEquals ? '>=' : '>')
  static isBefore = (entry, againstEntry, orEquals = false)=>rangeUtil.compare(entry, againstEntry, orEquals ? '<=' : '<')
}
class rndUtil {
  static numBetween(min = 0, max = 1, rounded = true) {
    let result = min
    let increment = (max-min)*Math.random()
    if (rounded) increment = Math.round(increment)
    result += increment
    return result
  }
  static numBetweenSqrt(min = 0, max = 1, rounded = true, disallowZero = false) {
    if (min >= max || disallowZero && max < 1) return min
    let possibleResults = []
    let numPossibleResults = Math.sqrt(max-min)
    for (let i = 0; i < numPossibleResults; i++) possibleResults.push(rndUtil.numBetween(min, max, rounded))
    let result = Math.min(...possibleResults)
    if (disallowZero && !result) return rndUtil.numBetweenSqrt(min, max, rounded, disallowZero)
    return result
  }
  static memberOf(arr = []) {
    return arr[rndUtil.numBetween(0,arr.length-1)]
  }
  static memberOfWeighted(arr = [], weights = []) {
    if (arr.length == 0) return undefined
    if (arr.length == 1) return arr[0]
    let totalWeight = numUtil.getTotal(weights)
    let rndWeight = totalWeight * Math.random()
    totalWeight = 0
    for (let i = 0; i < weights.length; i++) {
      totalWeight += weights[i]
      if (rndWeight < totalWeight) return arr[i]
    }
    throw new Error('member of weighted failed to return anything')
  }
  static nonRepeatingEntries(arr = [], numEntries = 1) {
    numEntries = Math.min(arr.length-1,numEntries)
    if (numEntries == 0) return []
    let remaining = [...arr]
    let result = []
    for (let i = 0; i < numEntries; i++) {
      let entry = rndUtil.memberOf(remaining)
      result.push(entry)
      arrUtil.safeRemove(remaining, entry)
    }
    return result
  }
}

class numUtil {
  static forceTotal(nums = [], total = 1, rounded = true) {
    let initialTotal = numUtil.getTotal(nums)
    let modifier = total/initialTotal
    let result = nums.map(num=>num*modifier)
    if (rounded) result = result.map(num=>Math.round(num))
    return result
  }
  static getTotal(arr = []) {
    let total = 0
    for (let num of arr) total += num
    return total
  }
  static clamp(floor = -Infinity, ceiling = Infinity, num = 0) {
    if (ceiling !== undefined) num = Math.min(num, ceiling)
    if (floor !== undefined) num = Math.max(num, floor)
    return num
  }
  static asPercent(ratio = 1, numDecimals = 2, stringForm = true) {
    let percent = Math.round( ratio * 100 * Math.pow(10, numDecimals) )
    percent /= Math.pow(10, numDecimals)
    if (stringForm) percent = `${percent}%`
    return percent
  }
}


class arrUtil {
  static removeEntriesContaining(arr = [], subEntry) {
    let toRemove = []
    //eeeeee+x1onsole.log('before removal:',arr,subEntry)
    for (let entry of arr) if (entry.includes(subEntry)) toRemove.push(entry)
    //console.log('going to remove:',toRemove,'from:',arr)
    for (let entry of toRemove) arrUtil.safeRemove(arr, entry)
    //console.log('after removal:',arr,subEntry)
  }
  static sortByNumericValue(arr = [], key = '', descending = false) {
    arr = [...arr]
    arr.sort( (a,b)=>{
      return descending ? b[key]-a[key] : a[key]-b[key]
    })
    return arr
  }
  static containsSameEntries(arr1 = [], arr2 = []) {
    for (let entry of arr1) if (!arr2.includes(entry)) return false
    for (let entry of arr2) if (!arr1.includes(entry)) return false
    return true
  }
  static getEntryAtRatio(arr = [], ratio = 1) {
    return arr[Math.round(ratio*(arr.length-1))]
  }
  static safeRemove(arr = [], entry) {
    if (arr.includes(entry)) arr.splice(arr.indexOf(entry),1)
    return arr
  }
  static safeAdd(arr = [], entry) {
    if (Array.isArray(entry)) for (let subEntry of entry) arrUtil.safeAdd(arr, subEntry)
    else if (!arr.includes(entry)) arr.push(entry)
    return arr
  }
  static fillArray(numColumns = 1, fillFunc = (index)=>true) {
    let result = arrUtil.fill2dArray(1, numColumns, (x,y)=>fillFunc(x))
    return result[0]
  }
  static fill2dArray(numRows = 1, numColumns = 1, fillFunc = (x,y)=>true) {
    let result = []
    for (let y = 0; y < numRows; y++) {
      result.push([])
      for (let x = 0; x < numColumns; x++) {
        result[y][x] = fillFunc(x,y)
      }
    }
    return result
  }
  static getUniqueEntries(arr = []) {
    return Array.from(new Set(arr))
  }
}


class objUtil {
  static merge(objs = []) {
    let result = {}
    for (let obj of objs) for (let key in obj) result[key] = obj[key]
    return result
  }
}


//quick links
let {slice, from, to, isBefore, isAfter} = rangeUtil
