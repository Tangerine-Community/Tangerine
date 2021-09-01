
export class InputChange {
  name:string
  a:any
  b:any
}

export function diffTemplate(diff:Array<InputChange>) {
  return `
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
          ${valueTemplate(change.a.value)}
        </td>
        <td class="value">
          ${change.b ? valueTemplate(change.b.value): 'Missing input'}
        </td>
      </tr>
      `).join('')}
    </table>
  `
}

function valueTemplate(value) {
  return `
    ${typeof value === 'object' ? `<pre>${JSON.stringify(value, undefined, 4)}</pre>` : value}
  `
}
