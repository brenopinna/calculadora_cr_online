function calcularCR() {
  const input = document.getElementById("iduff").value
  const linhas = input.split("\n")

  let line = 0
  let totalHoras = 0
  let somaPonderada = 0

  for (let i = 0; i < linhas.length; i++) {
    line++
    if (line % 3 === 0) {
      const partes = linhas[i].split(/[\s:]+/) // divide por espaços e ':'
      const nota = parseFloat(partes[1])
      const ch = parseInt(partes[3])

      if (!isNaN(nota) && !isNaN(ch)) {
        somaPonderada += nota * ch
        totalHoras += ch
      }
    }
  }

  const cr = somaPonderada / totalHoras
  document.getElementById("resultado").innerText = `Seu CR é: ${cr.toFixed(2)}.`
}
