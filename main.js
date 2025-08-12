const modeInputs = document.querySelectorAll("[name=mode]")
const iduff = document.getElementById("iduff-section")
const iduffTextarea = document.getElementById("iduff")
const manual = document.getElementById("manual-section")
const result = document.getElementById("result")
const subjects = document.getElementById("subjects")
const scheduleGenTableBody = document.getElementById("schedule-generator")
const scheduleResultSection = document.getElementById("schedule-result-section")
const addScheduleSubjectButton = document.getElementById("add-schedule-subject")
const dayHours = [
  "Vazio",
  "07-09h",
  "09-11h",
  "11-13h",
  "14-16h",
  "16-18h",
  "18-20h",
  "20-22h",
]

const info = calculateCR(localStorageToArray())

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

function createScheduleGeneratorLine() {
  const tr = document.createElement("tr")
  const tds = Array.from({ length: 7 }).map((_, i) => {
    const td = document.createElement("td")
    let input
    if (i == 6) {
      input = document.createElement("input")
      input.type = "checkbox"
    } else if (i != 0) {
      input = document.createElement("select")
      for (let s of dayHours) {
        const opt = document.createElement("option")
        opt.value = +s.split("-")[0] || null
        opt.innerText = s
        input.appendChild(opt)
      }
      input.classList.add("select-info")
    } else {
      input = document.createElement("input")
      input.classList.add("input-info")
    }
    td.appendChild(input)
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
      let inputMatches = Array.from(
        document.querySelectorAll("#schedule-generator .input-info"),
      ).filter((input, _) => input.value == name)
      for (let inputMatch of inputMatches) {
        const rowToDelete = inputMatch.parentNode.parentNode
        scheduleGenTableBody.removeChild(rowToDelete)
      }
    }
  })

  tr.append(...tds, deleteCell)

  return tr
}

function addLineToSheduleGeneratorTable() {
  scheduleGenTableBody.appendChild(createScheduleGeneratorLine())
}

function scheduleGeneratorTableToArray() {
  const tableRows = document.querySelectorAll("#schedule-generator tr")
  const subjectsSchedule = []
  const requiredSubjects = []
  tableRows.forEach((tr, _) => {
    const name = tr.children[0].children[0].value
    const hours = []
    for (let i = 1; i < 6; i++) {
      hours.push(+tr.children[i].children[0].value || null)
    }
    const required = tr.children[6].children[0].checked
    if (required) requiredSubjects.push(name)
    subjectsSchedule.push([name, hours])
  })
  return [subjectsSchedule, requiredSubjects]
}

function createScheduleResultTableLine(subjectSchedule, lineNumber) {
  const tr = document.createElement("tr")
  const tds = Array.from({ length: 6 }).map((_, i) => {
    const td = document.createElement("td")
    const p = document.createElement("p")
    if (i == 0) {
      p.innerText = dayHours[lineNumber]
    } else {
      if (subjectSchedule[i - 1] != "") p.innerText = subjectSchedule[i - 1]
    }
    td.appendChild(p)
    return td
  })

  tr.append(...tds)

  return tr
}

function addLineToScheduleResultTable(scheduleTable, subjectSchedule, lineNumber) {
  scheduleTable
    .querySelector("tbody")
    .appendChild(createScheduleResultTableLine(subjectSchedule, lineNumber))
}

function zipSubjects(subjectsSchedule) {
  const finalSchedule = new Array(7).fill(0).map(() => new Array(5).fill(""))
  subjectsSchedule.forEach((ss) => {
    const [name, hours] = ss
    for (let i = 0; i < 6; i++) {
      if (!hours[i]) continue
      let hoursIndex
      if (hours[i]) {
        if (hours[i] > 11) {
          hoursIndex = parseInt((hours[i] - 8) / 2)
        } else {
          hoursIndex = parseInt((hours[i] - 7) / 2)
        }
        finalSchedule[hoursIndex][i] = name
      }
    }
  })
  return finalSchedule
}

function hasConflict(combination, subject) {
  return !!combination.find((combSubject) => {
    for (let i = 0; i < combSubject[1].length; i++) {
      if (combSubject[1][i] != null && combSubject[1][i] === subject[1][i]) {
        return true
      }
    }
    return false
  })
}

function combinationIncludesAllRequiredSubjects(combination, requiredSubjects) {
  const combinationNames = combination.reduce((acc, subject) => {
    return [...acc, subject[0]]
  }, [])
  return requiredSubjects
    .map((req) => combinationNames.includes(req))
    .every((v) => v != false)
}

function fixedSizeScheduleCombinations(
  scheduleArray,
  requiredSubjects,
  scheduleArrayIndex,
  size,
  combination,
  acumulator,
) {
  if (combination.length != size && scheduleArrayIndex != size) {
    for (let i = scheduleArrayIndex; i < scheduleArray.length; i++) {
      const newCombination = [...combination]
      const nextSubject = scheduleArray[i]
      if (
        !newCombination.includes(nextSubject) &&
        !hasConflict(newCombination, nextSubject)
      ) {
        newCombination.push(nextSubject)
        if (
          !acumulator.find(
            (val) => JSON.stringify(val.sort()) === JSON.stringify(newCombination.sort()),
          ) &&
          combinationIncludesAllRequiredSubjects(newCombination, requiredSubjects)
        ) {
          acumulator.push(newCombination)
        }
      }
      fixedSizeScheduleCombinations(
        scheduleArray,
        requiredSubjects,
        scheduleArrayIndex + 1,
        size,
        newCombination,
        acumulator,
      )
    }
  }
}

function scheduleCombinations(scheduleArray, requiredSubjects) {
  const combinations = []
  for (let size = 1; size <= scheduleArray.length; size++)
    fixedSizeScheduleCombinations(
      scheduleArray,
      requiredSubjects,
      0,
      size,
      [],
      combinations,
    )
  return combinations
}

function showScheduleResultTable(button, className) {
  if (className == "calculate") {
    const [result, required] = scheduleGeneratorTableToArray()
    const filteredResult = result.filter((val) => {
      const name = val[0]
      const hours = val[1]
      return !hours.every((val) => val === null) && name != ""
    })
    if (filteredResult.length == 0) {
      alert(
        "Preencha ao menos uma disciplina com o nome e ao menos um horário de aula para prosseguir.",
      )
      return
    }
    const combinations = scheduleCombinations(filteredResult, required)
    scheduleResultSection.innerHTML = ""
    const defaultTable = scheduleGenTableBody.parentNode.cloneNode(true)
    const defaultTableBody = defaultTable.childNodes[3]
    defaultTableBody.id = ""
    defaultTableBody.innerHTML = ""
    const defaultTableFirstColumnTitle =
      defaultTable.childNodes[1].childNodes[1].childNodes[1]
    defaultTableFirstColumnTitle.innerText = "Horários"
    combinations.forEach((combination) => {
      const newTable = defaultTable.cloneNode(true)
      const scheduleHours = zipSubjects(combination)
      dayHours.forEach((_, lineNumber) => {
        if (lineNumber != 0) {
          const sh = scheduleHours[lineNumber - 1]
          addLineToScheduleResultTable(newTable, sh, lineNumber)
        }
      })
      scheduleResultSection.appendChild(newTable)
    })
    const requiredHeaders = document.querySelectorAll(
      "table:not(#cr-calc-table) th:last-of-type",
    )
    requiredHeaders.forEach((th) => th.classList.add("hide"))
    button.innerText = "Voltar"
    button.className = "return"
    scheduleGenTableBody.parentNode.classList.add("hide")
    scheduleResultSection.classList.remove("hide")
    addScheduleSubjectButton.classList.add("hide")
  } else if (className == "return") {
    const requiredHeaders = document.querySelectorAll(
      "table:not(#cr-calc-table) th:last-of-type",
    )
    requiredHeaders.forEach((th) => th.classList.remove("hide"))
    button.innerText = "Gerar horários"
    button.className = "calculate"
    scheduleResultSection.classList.add("hide")
    scheduleGenTableBody.parentNode.classList.remove("hide")
    addScheduleSubjectButton.classList.remove("hide")
  }
}
