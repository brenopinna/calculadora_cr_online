const info = calcularCR(localStorageParaArray())

const iduff = document.getElementById("iduff-section")
const manual = document.getElementById("manual-section")

document.querySelectorAll("[name=mode]").forEach((modeInput) => {
  modeInput.addEventListener("change", (e) => {
    const target = e.target
    if (target.id === "iduff-select") {
      iduff.classList.remove("hide")
      manual.classList.add("hide")
    } else {
      carregarInformacoesParaTabela()
      calcularCR(tabelaParaArray())
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
    info[i] = [nomes[i], cargasHorarias[i], notas[i]]
  }

  localStorage.setItem("info", JSON.stringify(info))

  return info
}

function localStorageParaArray() {
  const info = JSON.parse(localStorage.getItem("info")) ?? []
  return info.length ? info : null
}

function calcularCR(info) {
  let totalHoras = 0
  let somaPonderada = 0

  for (let i = 0; info && i < info.length; i++) {
    let ch = info[i][1],
      nota = info[i][2]
    totalHoras += ch
    somaPonderada += nota * ch
  }

  let cr = somaPonderada / totalHoras

  if (!info) cr = 0

  if (isNaN(totalHoras) || isNaN(somaPonderada) || isNaN(cr)) {
    return
  }

  document.getElementById("resultado").innerText = `Seu CR é: ${cr.toFixed(2)}.`
}

function tabelaParaArray() {
  const inputs = Array.from(document.querySelectorAll(".input-info"))
  const info = []
  inputs.forEach((input, i) => {
    if (i % 3 == 0) {
      info[parseInt(i / 3)] = [input.value]
    } else if (i % 3 == 1) {
      info[parseInt(i / 3)].push(parseInt(input.value) || 0)
    } else if (i % 3 == 2) {
      info[parseInt(i / 3)].push(parseFloat(input.value) || 0)
    }
  })
  return info.length ? info : null
}

function carregarInformacoesParaTabela() {
  const infos = localStorageParaArray()
  const disciplinas = document.getElementById("disciplinas")
  disciplinas.innerHTML = ""
  if (!infos) {
    return
  }
  infos.forEach((info) => {
    disciplinas.appendChild(criarLinha(...info))
  })
}

function criarLinha(nome, cargaHoraria, nota) {
  const params = [nome, cargaHoraria, nota]
  const tr = document.createElement("tr")
  const tds = Array.from({ length: 3 }).map((_, i) => {
    const td = document.createElement("td")
    const input = document.createElement("input")
    input.classList.add("input-info")
    if (params[i]) input.value = params[i]
    td.appendChild(input)
    td.children[0].addEventListener("change", () => {
      const info = tabelaParaArray()
      calcularCR(info)
      localStorage.setItem("info", JSON.stringify(info))
    })
    return td
  })

  const deleteCell = document.createElement("td")
  deleteCell.classList.add("delete-cell")
  const deleteElement = document.createElement("div")
  deleteElement.innerText = "X"
  deleteElement.classList.add("delete")
  deleteCell.appendChild(deleteElement)

  deleteElement.addEventListener("click", (e) => {
    const row = e.target.parentNode.parentNode
    const nameCell = row.children[0]
    const nameInput = nameCell.children[0]
    const name = nameInput.value
    if (confirm(`Deseja excluir a disciplina "${name}"?`)) {
      const info = localStorageParaArray()
      const newInfo = info.filter((v) => v[0] != name)
      localStorage.setItem("info", JSON.stringify(newInfo))
      carregarInformacoesParaTabela()
      calcularCR(tabelaParaArray())
    }
  })

  tr.append(...tds, deleteCell)

  return tr
}

function adicionarLinha() {
  document.getElementById("disciplinas").appendChild(criarLinha())
}
