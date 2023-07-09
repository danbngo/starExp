
let gc = document.createElement('div')
document.body.appendChild(gc)

//## HEADER
//# Section Header
//@LinkText:linkFunc


class ui {
  static table(content = '', numColumns = 2) {
    let tds = content.split('\n')
    tds = tds.filter(td=>(td.length > 0))
    if (tds.length == 0) return ''
    tds = tds.map(td=>`<td>${td}</td>`)
    let numRows = Math.ceil(tds.length/numColumns)
    let trs = []
    for (let i = 0; i < numRows; i++) {
      let rowCells = tds.slice(i*numColumns, (i+1)*numColumns)
      trs.push(`<tr>${rowCells.join('')}</tr>`)
    }
    return `<table>${trs.join('')}</table>`
  }
  static newPage(content = '') {
    let lines = content.split('\n')
    let formattedLines = lines.map(line=>{
      while (line.charAt(0) == ' ') line = line.slice(1)
      let lineContent = line.split('#').join('').split('@').join('')
      let lineAfter = lineContent.includes(':::') ? lineContent.split(':::')[1] : ''
      let lineBefore = lineContent.includes(':::') ? lineContent.split(':::')[0] : ''
      if (line.charAt(0) == '#' && line.charAt(1) == '#') line = `<div class='gamePageHeader'>${lineContent}</div>`
      else if (line.charAt(0) == '#') line = `<div class='gameSectionHeader'>${lineContent}</div>`
      else if (line.charAt(0) == '@') line = `<div class='gameButton' onclick=${lineAfter}>${lineBefore}</div>`
      else line = `<div class='gameText'>${lineContent}</div>`
      return line
    })
    let formattedContent = formattedLines.join('')//formattedLines.join('<br>')
    while (formattedContent.includes('<br><br>')) formattedContent = formattedContent.split('<br><br>').join('<br>')
    gc.innerHTML = formattedContent
  }
}
