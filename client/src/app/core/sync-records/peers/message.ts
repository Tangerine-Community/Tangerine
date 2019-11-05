export class Message {
  messageType: string;
  message: string;
  object: any;

  // function Message(messageType, message, object) {
  //   this.messageType = messageType;
  //   this.message = message;
  //   this.object = object;
  // }

  constructor(messageType: string, message: string, object: any) {
    this.messageType = messageType;
    this.message = message;
    this.object = object;
  }
}
