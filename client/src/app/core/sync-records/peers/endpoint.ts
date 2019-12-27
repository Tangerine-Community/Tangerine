export class Endpoint {
  id: string;
  endpointName: string;
  status = 'Pending';

  constructor(id: string, endpointName: string, status: string) {
    this.id = id;
    this.endpointName = endpointName;
    this.status = status;
  }
}
