import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateValuePipe'
})
export class TruncateValuePipe implements PipeTransform {
  /**
   * @ngModule SharedModule
   * @whatItDoes Transforms text by truncating it
   * @howToUse `value | truncateString[:characters:[ellipsis]]`
   *
   * @param value is any valid JavaScript Value
   * @param characters is the number of characters to show
   * @param ellipsis is the text that is appended to the transformed value to show that
   *  the value is truncated
   * @returns {string} the transformed text
   * @TODO: add examples
   *
   */
  transform(value: any, characters?: number, ellipsis?: any): string {
    value = value ? value.toString() : '';
    characters = characters ? characters : value.length;
    if (value.length <= characters || value.characters < 1) {
      return value.toString();
    }
    ellipsis = ellipsis ? ellipsis : '...';
    value = value.slice(0, characters);
    return value + ellipsis;
  }

}
