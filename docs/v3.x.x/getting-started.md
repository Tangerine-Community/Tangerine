# Getting Started

## How to get data out of a TangyFormResponse

```
const studentRegistrationDoc = await dashboardService.getResponse(this.studentId);
const srInputs = this.getInputValues(studentRegistrationDoc);

  getInputValues(doc) {
    let inputs = doc.items.reduce((acc, item) => [...acc, ...item.inputs], [])
    let obj = {}
    for (const el of inputs) {
      var attrs = inputs.attributes;
      for(let i = inputs.length - 1; i >= 0; i--) {
        obj[inputs[i].name] = inputs[i].value;
      }
    }
    console.log("obj: " + JSON.stringify(obj))
    return obj;
  }
```
