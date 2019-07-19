import { Injectable } from '@angular/core';
import { UserService } from 'src/app/shared/_services/user.service';
import { CaseEvent } from '../classes/case-event.class';
import { Case } from '../classes/case.class';

@Injectable({
  providedIn: 'root'
})
export class CasesService {

  constructor(
    private userService:UserService
  ) { }

  async getEventsByDate (dateStart, dateEnd, excludeEstimates = false):Promise<Array<CaseEvent>> {
    const userDb = this.userService.getUserDatabase(this.userService.getCurrentUser());
    const allDocs = await userDb.allDocs({include_docs:true})

    return <Array<CaseEvent>>(allDocs)
      .rows
      .map(row => row.doc)
      .filter(doc => doc.collection === 'TangyFormResponse' && doc.type === 'case')
      .reduce((acc, caseDoc) => [...acc, ...caseDoc.events], <Array<CaseEvent>>[])
      .filter(eventInfo => this.doesOverlap(dateStart, dateEnd, eventInfo) && !(excludeEstimates && eventInfo.estimate))
      .sort(function (a, b) {
        return b.dateStart - a.dateStart;
      })
  }

  private doesOverlap(dateStart, dateEnd, eventInfo):boolean {
    // Return true if lower bound overlap, upper bound overlap, inside bounds, or encompassing bounds.
    return (eventInfo.dateStart <= dateStart && dateStart <= eventInfo.dateEnd)
        || (eventInfo.dateStart <= dateEnd && dateEnd <= eventInfo.dateEnd)
        || (eventInfo.dateStart >= dateStart && dateEnd >= eventInfo.dateEnd)
        || (eventInfo.dateStart <= dateStart && dateEnd <= eventInfo.dateEnd)
  }
}
