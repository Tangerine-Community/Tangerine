export class Message {
  messageType: string;
  message: string;
  object: any;
  destination: string;
  originName: string;

  constructor(messageType: string, message: string, object: any, destination: string, originName: string) {
    this.messageType = messageType;
    this.message = message;
    this.object = object;
    this.destination = destination;
    this.originName = originName;
  }
}
