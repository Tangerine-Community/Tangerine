import { Injectable } from '@angular/core';

@Injectable()
export class LocationFormControlTypesService {

  constructor() { }
  getControlTypes(): string[] {
    return [
      'Number',
      'Text',
      'Select'
    ];
  }
}
