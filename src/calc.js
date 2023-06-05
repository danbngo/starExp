class objectCalc {
  static calcVolume(mass = 1, density = 1) {
    return mass/density
  }
  static calcRadius(volume = 1) {
    //R = [(3V) / (4π)]^(1/3)
    return Math.pow(3*volume/(4*Math.PI),1/3)
  }
  static calcSurfaceArea(radius = 1) {
    return 4*Math.PI*Math.pow(radius,2)
  }
  static calcGravity(mass, radius) {
    return mass/Math.pow(radius,2) * 10
  }
}