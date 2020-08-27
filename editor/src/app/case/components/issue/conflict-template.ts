import {Conflict} from "../../classes/conflict.class";

export function conflictTemplate(diffOutput, noShowB) {
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
        text-align: center;
      }
      .noShowB {
      visibility: hidden;
      }
    </style>
    <table class="diff-table">
      <tr>
        <td class="blank-cell"></td>
        <td class="header-cell">A</td>
        <td class="header-cell ${noShowB ? 'noShowB' : ''}">B</td>
      </tr>
      ${diffOutput.map(change => `
      <tr>
        <td class="label">
          <b>${change.name}</b>
        </td>
        <td class="value">
          ${change.newValue ? change.newValue : change.value}
        </td>
        <td class="value ${noShowB ? 'noShowB' : ''}">
          ${change.oldValue}
        </td>
      </tr>
      `).join('')}
    </table>

  `
}

