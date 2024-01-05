export class MediaInput {
  formItem:string;
  mediaElements:Array<string>


  constructor(formItem: string, mediaElements: Array<string>) {
    this.formItem = formItem;
    this.mediaElements = mediaElements;
  }
}
