export class Endpoint {
  id: String;
  endpointName: String;
  status: String = 'Pending';

  constructor(id: String, endpointName: String, status: String) {
    this.id = id;
    this.endpointName = endpointName;
    this.status = status;
  }
}
