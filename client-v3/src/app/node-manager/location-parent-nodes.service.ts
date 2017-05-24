import { Injectable } from '@angular/core';

@Injectable()
export class LocationParentNodesService {

  nodes = [
    {
      'type': 'node',
      'parent': null,
      'label': 'None',
      'uuid': null
    },
    {
      'type': 'node',
      'parent': null,
      'label': 'County',
      'uuid': 'c3c834fc-3bb9-11e7-a919-92ebcb67fe33'
    },
    {
      'type': 'node',
      'parent': 'c3c834fc-3bb9-11e7-a919-92ebcb67fe33',
      'label': 'Sub-County',
      'uuid': 'f04ac3a0-3bb9-11e7-a919-92ebcb67fe33'
    },
    {
      'type': 'node',
      'parent': 'f04ac3a0-3bb9-11e7-a919-92ebcb67fe33',
      'label': 'District',
      'uuid': 'c3c834fc-3bb9-11e7-a919-92ebcb67fe33'
    }
  ];
  getParentNodes() {
    return this.nodes;
  }
  constructor() { }

}
