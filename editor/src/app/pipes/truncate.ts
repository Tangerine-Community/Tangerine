// truncate.ts

//FOR SOME REASON THIS STOPPED WORKING AS OF NEW VERSION OF ANGULAR SO SETTING DEFAULT TO WHAT IS NEEDED FOR REGISTRATION
import {Pipe, PipeTransform} from '@angular/core'

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, args: string[]) : string {
    let limit = args.length > 0 ? parseInt(args[0], 10) : 30;
    let trail = args.length > 1 ? args[1] : '...';

    return value.length > limit ? value.substring(0, limit) + trail : value;
  }
}
