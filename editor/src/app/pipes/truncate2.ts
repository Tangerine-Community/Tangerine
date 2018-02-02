// truncate.ts

//FOR SOME REASON THIS STOPPED WORKING AS OF NEW VERSION OF ANGULAR SO SETTING DEFAULT TO WHAT IS NEEDED FOR 
//DATE AS DATE PIPE IS NOT WORKING IN SAFARI WE ARE USING TRUNCATE FOR NOW
import {Pipe} from '@angular/core'

@Pipe({
  name: 'truncate2'
})
export class TruncatePipe2 {
  transform(value: string, args: string[]) : string {
    let limit = args.length > 0 ? parseInt(args[0], 10) : 10;
    let trail = args.length > 1 ? args[1] : '';

    return value.length > limit ? value.substring(0, limit) + trail : value;
  }
}