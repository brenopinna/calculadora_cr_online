function textoIduffParaNumeros() {
  const input = document.getElementById("iduff").value
  const linhas = input.split("\n")

  let cargasHorarias = []
  let notas = []

  let line = 0

  for (let i = 0; i < linhas.length; i++) {
    line++
    if (line % 3 === 0) {
      const partes = linhas[i].split(/[\s:]+/) // divide por espaços e ':'
      const nota = parseFloat(partes[1])
      const ch = parseInt(partes[3])

      if (!isNaN(nota) && !isNaN(ch)) {
        notas.push(nota)
        cargasHorarias.push(ch)
      }
    }
  }

  let duplas = []
  for (let i = 0; i < cargasHorarias.length; i++) {
    duplas[i] = [cargasHorarias[i], notas[i]]
  }

  return duplas
}

function calcularCR(horasENotas) {
  let totalHoras = 0
  let somaPonderada = 0

  for (let i = 0; i < horasENotas.length; i++) {
    let ch = horasENotas[i][0],
      nota = horasENotas[i][1]
    totalHoras += ch
    somaPonderada += nota * ch
  }

  let cr = somaPonderada / totalHoras

  if (isNaN(totalHoras) || isNaN(somaPonderada)) {
    cr = 0
  }

  document.getElementById("resultado").innerText = `Seu CR é: ${cr.toFixed(2)}.`
}

const iduff = document.getElementById("iduff-section")
const manual = document.getElementById("manual-section")

document.querySelectorAll("[name=mode]").forEach((modeInput) => {
  modeInput.addEventListener("change", (e) => {
    const target = e.target
    if (target.id === "iduff-select") {
      iduff.classList.remove("hide")
      manual.classList.add("hide")
    } else {
      iduff.classList.add("hide")
      manual.classList.remove("hide")
    }
  })
})

function tabelaParaNumeros() {
  const inputs = Array.from(document.querySelectorAll(".input-info"))
  const horasENotas = [[]]
  inputs.forEach((input, i) => {
    if (i % 3 == 1) {
      horasENotas[parseInt(i / 3)] = [parseInt(input.value)]
    } else if (i % 3 == 2) {
      horasENotas[parseInt(i / 3)].push(parseFloat(input.value))
    }
  })
  return horasENotas
}

function adicionarLinha() {
  const tr = document.createElement("tr")
  const tds = Array.from({ length: 3 }).map(() => {
    const td = document.createElement("td")
    const input = document.createElement("input")
    input.classList.add("input-info")
    td.appendChild(input)
    td.children[0].addEventListener("change", () => {
      calcularCR(tabelaParaNumeros())
    })
    return td
  })

  tr.append(...tds)

  document.getElementById("disciplinas").appendChild(tr)
}
