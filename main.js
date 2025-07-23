carregarInformacoesParaTabela()
calcularCR(tabelaParaArray())

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

function textoIduffParaArray() {
  const input = document.getElementById("iduff").value
  const linhas = input.split("\n")

  let cargasHorarias = []
  let notas = []
  let nomes = []

  let line = 0

  for (let i = 0; i < linhas.length; i++) {
    line++
    if (line % 3 == 1) {
      const [_, ...nome] = linhas[i].split(/[\s:]+/) // divide por espaços e ':'
      nomes.push(nome.join(" "))
    }
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

  let info = []
  for (let i = 0; i < cargasHorarias.length; i++) {
    info[i] = [cargasHorarias[i], notas[i], nomes[i]]
  }

  localStorage.setItem("info", JSON.stringify(info))

  return info
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
    return
  }

  document.getElementById("resultado").innerText = `Seu CR é: ${cr.toFixed(2)}.`
}

function tabelaParaArray() {
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

function carregarInformacoesParaTabela() {
  const infos = JSON.parse(localStorage.getItem("info"))
  if (!infos) return
  const disciplinas = document.getElementById("disciplinas")
  infos.forEach((info) => {
    disciplinas.appendChild(criarLinha(...info))
  })
}

function criarLinha(cargaHoraria, nota, nome) {
  const params = [nome, cargaHoraria, nota]
  const tr = document.createElement("tr")
  const tds = Array.from({ length: 3 }).map((_, i) => {
    const td = document.createElement("td")
    const input = document.createElement("input")
    input.classList.add("input-info")
    if (params[i]) input.value = params[i]
    td.appendChild(input)
    td.children[0].addEventListener("change", () => {
      calcularCR(tabelaParaArray())
    })
    return td
  })

  tr.append(...tds)

  return tr
}

function adicionarLinha() {
  document.getElementById("disciplinas").appendChild(criarLinha())
}
