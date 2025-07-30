const iduff = document.getElementById("iduff-section")
const iduffTextarea = document.getElementById("iduff")
const manual = document.getElementById("manual-section")
const result = document.getElementById("result")
const subjects = document.getElementById("subjects")

const info = calculateCR(localStorageToArray())

const modeInputs = document.querySelectorAll("[name=mode]")

modeInputs.forEach((modeInput) => {
  modeInput.addEventListener("change", (e) => {
    const targetId = e.target.id.split("-")[0]
    const otherInputs = Array.from(modeInputs).filter(
      (input) => !input.id.includes(targetId),
    )

    otherInputs.forEach((input) => {
      const inputId = input.id.split("-")[0]
      const section = document.getElementById(`${inputId}-section`)
      section.classList.add("hide")
      section.ariaHidden = true
    })

    const target = document.getElementById(`${targetId}-section`)
    target.classList.remove("hide")
    target.ariaHidden = false

    if (target.id.includes("manual")) localStorageToSubjectsTable()
  })
})

function iduffTextToArray() {
  const input = iduffTextarea.value
  const lines = input.split("\n")

  let classHours = []
  let grades = []
  let names = []

  let line = 0

  for (let i = 0; i < lines.length; i++) {
    line++
    if (line % 3 == 1) {
      const [_, ...name] = lines[i].split(/[\s:]+/) // divide por espaços e ':'
      names.push(name.join(" "))
    }
    if (line % 3 === 0) {
      const fragments = lines[i].split(/[\s:]+/) // divide por espaços e ':'
      const grade = parseFloat(fragments[1])
      const hours = parseInt(fragments[3])

      if (!isNaN(grade) && !isNaN(hours)) {
        grades.push(grade)
        classHours.push(hours)
      }
    }
  }

  let info = []
  for (let i = 0; i < classHours.length; i++) {
    info[i] = [names[i], classHours[i], grades[i]]
  }

  localStorage.setItem("info", JSON.stringify(info))

  return info
}

function localStorageToArray() {
  const info = JSON.parse(localStorage.getItem("info")) ?? []
  return info.length ? info : null
}

function calculateCR(info) {
  let totalHours = 0
  let weightedSum = 0

  for (let i = 0; info && i < info.length; i++) {
    let hours = info[i][1],
      grade = info[i][2]
    totalHours += hours
    weightedSum += grade * hours
  }

  let cr = weightedSum / totalHours

  if (!info) cr = 0

  if (isNaN(totalHours) || isNaN(weightedSum) || isNaN(cr)) {
    return
  }

  result.innerText = `Seu CR é: ${cr.toFixed(2)}.`
}

function subjectTableToArray() {
  const inputs = Array.from(document.querySelectorAll("#subjects .input-info"))
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

function localStorageToSubjectsTable() {
  const infos = localStorageToArray()
  subjects.innerHTML = ""
  if (!infos) {
    return
  }
  infos.forEach((info) => {
    subjects.appendChild(createSubjectLine(...info))
  })
}

function createSubjectLine(nome, cargaHoraria, nota) {
  const params = [nome, cargaHoraria, nota]
  const tr = document.createElement("tr")
  const tds = Array.from({ length: 3 }).map((_, i) => {
    const td = document.createElement("td")
    const input = document.createElement("input")
    input.classList.add("input-info")
    if (params[i]) input.value = params[i]
    td.appendChild(input)
    td.children[0].addEventListener("change", () => {
      const info = subjectTableToArray()
      calculateCR(info)
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
      const info = localStorageToArray()
      const newInfo = info.filter((v) => v[0] != name)
      localStorage.setItem("info", JSON.stringify(newInfo))
      localStorageToSubjectsTable()
      calculateCR(subjectTableToArray())
    }
  })

  tr.append(...tds, deleteCell)

  return tr
}

function addLineToSubjectsTable() {
  subjects.appendChild(createSubjectLine())
}
