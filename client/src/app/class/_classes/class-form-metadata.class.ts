export class ClassFormMetadata {
  name: string
  value: string
  label: string
  labelSafe: string

  constructor(data: any) {
    this.name = data.name;
    this.value = data.value;
    this.label = data.label;
    this.labelSafe = data.labelSafe;
  }
}
