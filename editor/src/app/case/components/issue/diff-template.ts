
export class InputChange {
  name:string
  a:any
  b:any
}

export function diffTemplate(diff:Array<InputChange>) {
  let html = ''
  try {
    html = `
      <style>
        .diff-table {
          width: 100%;
        }
        .diff-table td.label {
          padding: 15px;
          background: #CCC;
          margin: 5px;
          width: 20%;
        }
        .diff-table td.value {
          padding: 15px;
          background: #CCC;
          margin: 5px;
          width: 40%;
          overflow: scroll;
        }
        .diff-table .blank-cell {
          background: none;
        }
        .header-cell {
          font-weight: bolder;
        }
      </style>
      <table class="diff-table">
        <tr>
          <td class="blank-cell"></td> 
          <td class="header-cell">Original</td> 
          <td class="header-cell">Proposed</td> 
        </tr>
        ${diff.map(change => `
        <tr>
          <td class="label">
            <b>${change.a.label ? change.a.label : change.name}</b>
          </td>
          <td class="value">
            ${valueTemplate(change.a)}
          </td>
          <td class="value">
            ${valueTemplate(change.b)}
          </td>
        </tr>
        `).join('')}
      </table>
    `
  } catch (e) {
    console.error(e)
    html = `Unable to render diff`
  }
  return html
}

function valueTemplate(input) {
  try {
    if (!input) {
      return 'Variable not found'
    }
    else if (input.tagName === 'TANGY-RADIO-BUTTONS') {
      return input.value && input.value.some(option => option.value === 'on')
        ? input.value.find(option => option.value === 'on').name
        : ''
    } else if (
      input.tagName === 'TANGY-CHECKBOX' ||
      input.tagName === 'TANGY-TOGGLE'
    ) {
      return input.value ? 'on' : 'off'
    } else if (input.tagName === 'TANGY-CHECKBOXES') {
        return input.value
          .filter(option => option.value === 'on')
          .map(option => option.name)
          .join(', ')
    } else if (
      input.tagName === 'TANGY-SIGNATURE' || 
      input.tagName === 'TANGY-TIMED' || 
      input.tagName === 'TANGY-LOCATION' ||
      input.value === 'object'
    ) {
      return `(${`see form`})`
    } else {
      return input.value
    }
  } catch (error) {
    console.error(error)
    return 'Unable to display value'
  }
}
