export class Message {
  messageType: string;
  message: string;
  object: any;
  destination: string;

  // function Message(messageType, message, object) {
  //   this.messageType = messageType;
  //   this.message = message;
  //   this.object = object;
  // }

  constructor(messageType: string, message: string, object: any, destination: string) {
    this.messageType = messageType;
    this.message = message;
    this.object = object;
    this.destination = destination;
  }
}
