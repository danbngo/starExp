

class dictUtil {
  static addAll(dict = {}) {
    let ALL = []
    for (let key in dict) {
      ALL.push(dict[key])
      dict[key].dict = dict
    }
    dict.ALL = ALL
  }
  static range(fromEntry, toEntry) {
    let dict = fromEntry.dict
    let fromEntryIndex = fromEntry ? dict.ALL.indexOf(fromEntry) : 0
    let toEntryIndex = toEntry ? dict.ALL.indexOf(toEntry) : dict.ALL.length-1
    return dict.ALL.slice(fromEntryIndex, toEntryIndex-1)
  }
  static from(fromEntry) {
    return dictUtil.getRange(fromEntry.dict, fromEntry)
  }
  static to(toEntry) {
    return dictUtil.getRange(toEntry.dict, undefined, toEntry)
  }
  static memberOfWeighted(entries = []) {
    let weights = entries.map(entry=>entry.weight)
    return rndUtil.memberOfWeighted(entries, weights)
  }
  static getIndex(entry) {
    return entry.dict.ALL.indexOf(entry)
  }
  static getIndexRatio(entry) {
    return dictUtil.getIndex(entry)/(entry.dict.length-1)
  }
  static isBefore(entry, againstEntry, orEquals = false) {
    if (orEquals && entry == againstEntry) return true
    return dictUtil.getIndex(entry) < dictUtil.getIndex(againstEntry)
  }
  static isAfter(entry, againstEntry, orEquals = false) {
    if (orEquals && entry == againstEntry) return true
    return dictUtil.getIndex(entry) >  dictUtil.getIndex(againstEntry)
  }
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
}


class arrUtil {
  static safeRemove(arr = [], entry) {
    if (arr.includes(entry)) arr.splice(arr.indexOf(entry),1)
  }
  static safeAdd(arr = [], entry) {
    if (!arr.includes(entry)) arr.push(entry)
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
let {addAll, range, from, to, isBefore, isAfter} = dictUtil
