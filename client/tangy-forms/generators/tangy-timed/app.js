
function generateFlat(text, name, numberOfColumns) {

  let fragments = text.split(' ')
  fragments = fragments.filter((fragment) => fragment.trim() !== '')

  let tangyTimed = document.createElement('tangy-timed')
  tangyTimed.setAttribute('columns', numberOfColumns)
  tangyTimed.setAttribute('id', name)
  tangyTimed.setAttribute('duration', duration.value)

  let i = 0
  for (let fragment of fragments) {
    i++
    let input = document.createElement('input')
    input.setAttribute('name', `${name}-${i}`)
    // input.setAttribute('value', '')
    input.setAttribute('type', 'hidden')
    input.setAttribute('placeholder', fragment)
    tangyTimed.appendChild(input)
  }
  // Set up calculated variables.
  [
    '_last_selected_name', 
    '_last_selected_nth', 
    '_time_remaining', 
    '_time_spent', 
    '_items_per_minute', 
    '_number_of_items_marked'
  ].forEach((variable) => {
    let input = document.createElement('input')
    input.setAttribute('name', `${name}${variable}`)
    input.setAttribute('type', 'hidden')
    tangyTimed.appendChild(input)
  })

  window.demo.innerHTML = ''
  window.demo.appendChild(tangyTimed)

  let container = document.createElement('div')
  container.appendChild(tangyTimed.cloneNode(true))
  return container.innerHTML
}


window.go.addEventListener('click', () => {
  window.output.value = generateFlat(
    window.customText.value, 
    window.customName.value, 
    parseInt(window.numberOfColumns.value)
  )
})
window.output.value = generateFlat(
  window.customText.value, 
  window.customName.value, 
  parseInt(window.numberOfColumns.value)
)



