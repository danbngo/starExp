/*
extremely cold: <-200c
very cold: -100 to -200c
cold : 0c to -100c
medium: 0c to 50c
hot: 50c to 100c
very hot: 100c to 200c
extremely hot: >200c

vacuum: <0.001atm
extremely low: 0.01-0.001atm
very low: 0.1atm-0.01atm
low: 0.5-0.1atm
medium: 0.5-2atm
high: 2-10atm
very high: 10-50atm
extremely high: >50atm
*/

const PROXIMITIES = {
  KUIPER_BELT: {name:'Kuiper-Belt', index:0},
  EXTREMELY_FAR: {name:'Farthest', index:1},
  VERY_FAR: {name:'Farther', index:2},
  FAR: {name:'Far', index:3},
  MIDDLE: {name:'Middle', index:4},
  CLOSE: {name:'Close', index:5},
  VERY_CLOSE: {name:'Closer', index:6},
  EXTREMELY_CLOSE: {name:'Closest', index:7},
  TIDAL_ORBIT: {name:'Tidal Orbit', index:8},
}
listUtil.addAll(PROXIMITIES)

const SYSTEM_METALLICITIES = {
  NONE: {name:'None', index:0},
  EXTREMELY_LOW: {name:'Lowest', index:1},
  VERY_LOW: {name:'Lower', index:2},
  LOW: {name:'Low', index:3},
  MEDIUM: {name:'Medium', index:4},
  HIGH: {name:'High', index:5},
  VERY_HIGH: {name:'Higher', index:6},
  EXTREMELY_HIGH: {name:'Highest', index:7},
  METAL_RICH: {name:'Metal-rich', index:8},
}
listUtil.addAll(SYSTEM_METALLICITIES)

const SYSTEM_AGES = {
  PRIMORDIAL: {name:'Primordial', weight:1/6, index:0},
  EXTREMELY_OLD: {name:'Oldest', weight:1/5, index:1},
  VERY_OLD: {name:'Older',weight:1/4, index:2},
  OLD: {name:'Old', weight:1/3, index:3},
  MEDIUM: {name:'Medium', weight:1/2, index:4},
  YOUNG: {name:'Young', weight:1, index:5},
  VERY_YOUNG: {name:'Younger',weight:1/2, index:6},
  EXTREMELY_YOUNG: {name:'Youngest',weight:1/3, index:7},
  NEWBORN: {name:'Newborn',weight:1/4, index:8},
}
listUtil.addAll(SYSTEM_AGES)

const RADII = {
  TINY: {name:'Tiny', index:0},
  EXTREMELY_SMALL: {name:'Smallest', index:1},
  VERY_SMALL: {name:'Smaller', index:2},
  SMALL: {name:'Small', index:3},
  MEDIUM: {name:'Medium', index:4},
  LARGE: {name:'Large', index:5},
  VERY_LARGE: {name:'Larger', index:6},
  EXTREMELY_LARGE: {name:'Largest', index:7},
  GIGANTIC: {name:'Gigantic', index:7},
}
listUtil.addAll(RADII)

const MASSES = {
  TINY: {name:'Tiny', index:0},
  EXTREMELY_LIGHT: {name:'Lightest', index:1},
  VERY_LIGHT: {name:'Lighter', index:2},
  LIGHT: {name:'Light', index:3},
  MEDIUM: {name:'Medium', index:4},
  HEAVY: {name:'Heavy', index:5},
  VERY_HEAVY: {name:'Heavier', index:6},
  EXTREMELY_HEAVY: {name:'Heaviest', index:7},
  SUPER_MASSIVE: {name:'Super-Massive', index:8},
}
listUtil.addAll(MASSES)

const LUMINOSITIES = {
  BLACK: {name:'Black', index:0},
  EXTREMELY_DIM: {name:'Dimmest', index:1},
  VERY_DIM: {name:'Dimmer', index:2},
  DIM: {name:'Dim', index:3},
  MEDIUM: {name:'Medium', index:4},
  BRIGHT: {name:'Bright', index:5},
  VERY_BRIGHT: {name:'Brighter', index:6},
  EXTREMELY_BRIGHT: {name:'Brightest', index:7},
  DISINTEGRATING: {name:'Disintegrating', index:8},
}
listUtil.addAll(LUMINOSITIES)

const RADIATION_LEVELS = {
  TRACE: {name:'Trace', index:1},
  EXTREMELY_LOW: {name:'Lowest', index:1},
  VERY_LOW: {name:'Lower', index:2},
  LOW: {name:'Low', index:3},
  MEDIUM: {name:'Medium', index:4},
  HIGH: {name:'High', index:5},
  VERY_HIGH: {name:'Higher', index:6},
  EXTREMELY_HIGH: {name:'Highest', index:7},
  PERFORATING: {name:'Perforating', index:8},
}
listUtil.addAll(RADIATION_LEVELS)

const GRAVITY_LEVELS = {
  NEGLIGIBLE: {name:'Negligible', index:1, metric:[0,0.01]},
  EXTREMELY_LOW: {name:'Lowest', index:1, metric:[0.01,0.033]},
  VERY_LOW: {name:'Lower', index:2, metric:[0.033,0.1]},
  LOW: {name:'Low', index:3, metric:[0.1,0.33]},
  MEDIUM: {name:'Medium', index:4, metric:[0.33,2]},
  HIGH: {name:'High', index:5, metric:[2,4]},
  VERY_HIGH: {name:'Higher', index:6, metric:[4,8]},
  EXTREMELY_HIGH: {name:'Highest', index:7, metric:[8,16]},
  FLATTENING: {name:'Flattening', index:8, metric:[16,32]},
}
listUtil.addAll(GRAVITY_LEVELS)

const MOLECULAR_WEIGHTS = {
  TINY: {name:'Tiny', index:0, metric:[0,2]},
  EXTREMELY_LIGHT: {name:'Lightest', index:1, metric:[2,4]},
  VERY_LIGHT: {name:'Lighter', index:2, metric:[4,8]},
  LIGHT: {name:'Light', index:3, metric:[8,16]},
  MEDIUM: {name:'Medium', index:4, metric:[16,32]},
  HEAVY: {name:'Heavy', index:5, metric:[32,64]},
  VERY_HEAVY: {name:'Heavier', index:6, metric:[64,128]},
  EXTREMELY_HEAVY: {name:'Heaviest', index:7, metric:[128,256]},
  SUPER_MASSIVE: {name:'Super-Massive', index:8, metric:[256,512]},
}
listUtil.addAll(MOLECULAR_WEIGHTS)

const PRESSURES = { //atms
  VACUUM: {name:'Vacuum', index:0, metric:[0,0.001]},
  EXTREMELY_LOW: {name:'Lowest', index:1, metric:[0.001,0.01]},
  VERY_LOW: {name:'Lower', index:2, metric:[0.01,0.1]},
  LOW: {name:'Low', index:3, metric:[0.1,0.5]},
  MEDIUM: {name:'Medium', index:4, metric:[0.5,2]},
  HIGH: {name:'High', index:5, metric:[2,10]},
  VERY_HIGH: {name:'Higher', index:6, metric:[10,50]},
  EXTREMELY_HIGH: {name:'Highest', index:7, metric:[50,100]},
  CRUSHING: {name:'Crushing', index:8, metric:[100,4000]},
}
listUtil.addAll(PRESSURES)

const TEMPERATURES = { //celsius
  ABSOLUTE_ZERO: {name:'Absolute Zero', index:0, metric:[-273,-200]},
  EXTREMELY_COLD: {name:'Coldest', index:1, metric:[-200,-100]},
  VERY_COLD: {name:'Colder', index:2, metric:[-100,-50]},
  COLD: {name:'Cold', index:3, metric:[-50,0]},
  MEDIUM: {name:'Medium', index:4, metric:[0,50]},
  HOT: {name:'Hot', index:5, metric:[50,100]},
  VERY_HOT: {name:'Hotter', index:6, metric:[100,200]},
  EXTREMELY_HOT: {name:'Hottest', index:7, metric:[200,400]},
  INFERNO: {name:'Inferno', index:8, metric:[400,5000]},
}
listUtil.addAll(TEMPERATURES)
console.log(TEMPERATURES)

const GEOLOGICAL_ACTIVITY_LEVELS = {
  NONE: {name:'None', index:0},
  EXTREMELY_LOW: {name:'Lowest', index:1},
  VERY_LOW: {name:'Lower', index:2},
  LOW: {name:'Low', index:3},
  MEDIUM: {name:'Medium', index:4},
  HIGH: {name:'High', index:5},
  VERY_HIGH: {name:'Higher', index:6},
  EXTREMELY_HIGH: {name:'Highest', index:7},
  CONTINUAL: {name:'Continual', index:8},
}
listUtil.addAll(GEOLOGICAL_ACTIVITY_LEVELS)

const MAGNETIC_FIELD_LEVELS = {
  NONE: {name:'None', index:0},
  EXTREMELY_WEAK: {name:'Weakest', index:1},
  VERY_WEAK: {name:'Weaker', index:2},
  WEAK: {name:'Weak', index:3},
  MEDIUM: {name:'Medium', index:4},
  STRONG: {name:'Strong', index:5},
  VERY_SRONG: {name:'Stronger', index:6},
  EXTREMELY_STRONG: {name:'Strongest', index:7},
  IMPENETRABLE: {name:'Impenetrable', index:8},
}
listUtil.addAll(MAGNETIC_FIELD_LEVELS)

const DAY_LENGTHS = {
  MOMENTARY: {name:'Momentary', index:0},
  EXTREMELY_SHORT: {name:'Shortest', index:1},
  VERY_SHORT: {name:'Shorter', index:2},
  SHORT: {name:'Short', index:3},
  MEDIUM: {name:'Medium', index:4},
  LONG: {name:'Long', index:5},
  VERY_LONG: {name:'Longer', index:6},
  EXTREMELY_LONG: {name:'Longest', index:7},
  TIDALLY_LOCKED: {name:'Tidally Locked', index:8},
}
listUtil.addAll(DAY_LENGTHS)

const TILTS = {
  NONE: {name:'None', index:0},
  EXTREMELY_SLIGHT: {name:'Slightest', index:1},
  VERY_SLIGHT: {name:'Very Slight', index:2},
  SLIGHT: {name:'Slight', index:3},
  MEDIUM: {name:'Medium', index:4},
  PRONOUNCED: {name:'Heavy', index:5},
  VERY_PRONOUNCED: {name:'Heavier', index:6},
  EXTREMELY_PRONOUNCED: {name:'Heaviest', index:7},
  PERPENDICULAR: {name:'Perpendicular', index:8},
}
listUtil.addAll(TILTS)