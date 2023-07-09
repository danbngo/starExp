

class titleMenu {
  static start() {
    ui.newPage(`##SPACE EXPLORER
    v1.0
    @Quick Start:::titleMenu.quickStart()
    @Start:::titleMenu.introduction()`)
  }
  static quickStart() {
    
    mapMenu.start()
  }
  static introduction() {
    ui.newPage(`##INTRODUCTION
      Bla bla
      @Continue:::titleMenu.startGame()
      @Back:::titleMenu.start()`)
  }
  static startGame() {
    gs = {
      hull: [100,100],
      shields: [100,100],
      energy: [100,100],

      crew: [100,100],
      cargo: [0,100],

      lasers: 10,
      radars: 10,

      torpedoes: 10,
      probes: 10,
      fighters: 10,

      credits: 100,
      fame: 0,
      infamy: 0,
    }
    mainMenu.start()
  }
}




class mainMenu {
  static addStats(NAMES = []) {
    let text = ''
    for (let statKey of NAMES) {
      let value = gs[statKey]
      if (!value) continue
      if (Array.isArray(value)) text += `${statKey}: ${value[0]} / ${value[1]}`
      else text += `${statKey}: ${value}`
      text += '\n'
    }
    return ui.table(text, 4)
  }
  static addButtons() {
    return `
    @Map:::mapMenu.start()
    @Ship:::shipMenu.start()
    @Mission:::missionMenu.start()
    @Travel:::travelMenu.start()
    @Menu:::gameMenu.start()`
  }
  static start() {
    let stats = ''
    for (let names of STAT_NAMES) stats += '\n'+mainMenu.addStats(names)
    let buttons = mainMenu.addButtons()
    ui.newPage(`##GAME MENU
    ${stats}
    <hr>
    ${buttons}
    `)
  }
}

class mapMenu {

}