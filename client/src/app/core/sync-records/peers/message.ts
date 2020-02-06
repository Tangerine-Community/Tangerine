export class Message {
  messageType: string;
  message: string;
  object: any;
  destination: string;
  originName: string;
  payloadData: string

  constructor(messageType: string, message: string, object: any, destination: string, originName: string, payloadData: string) {
    this.messageType = messageType;
    this.message = message;
    this.object = object;
    this.destination = destination;
    this.originName = originName;
    this.payloadData = payloadData;
  }
}
