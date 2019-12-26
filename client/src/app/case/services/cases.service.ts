import { Injectable } from '@angular/core';
import { UserService } from 'src/app/shared/_services/user.service';
import { CaseEvent } from '../classes/case-event.class';
import { Case } from '../classes/case.class';
import { CaseEventInfo } from './case-event-info.class';
import { CaseService } from './case.service';

@Injectable({
	providedIn: 'root'
})
export class CasesService {

	constructor(
    private userService:UserService,
    private caseService:CaseService
	) { }

	async getEventsByDate (dateStart, dateEnd, excludeEstimates = false):Promise<Array<CaseEventInfo>> {
		const userDb = await this.userService.getUserDatabase(this.userService.getCurrentUser())
		const allDocs = await userDb.allDocs({include_docs:true})
		const docs = <Array<CaseEventInfo>>(allDocs)
			.rows
			.map(row => row.doc)
			.filter(doc => doc.collection === 'TangyFormResponse' && doc.type === 'case')
			.reduce((acc, caseDoc) => [...acc, ...caseDoc.events
			.map( event=>{
         return this.caseService.getCaseDefinitionByID(caseDoc.caseDefinitionId).then(caseDefinition=>{
           return{...event, caseInstance: caseDoc, caseDefinition}
         })
        })], <Array<CaseEventInfo>>[]);
			return Promise.all(docs).then( data=>data.filter(eventInfo => this.doesOverlap(dateStart, dateEnd, eventInfo) && !(excludeEstimates && eventInfo.estimate))
			.sort(function (a, b) {
				return b.dateStart - a.dateStart;
			}))
	}

	private doesOverlap(dateStart, dateEnd, eventInfo):boolean {
		// Return true if lower bound overlap, upper bound overlap, inside bounds, or encompassing bounds.
		return (eventInfo.dateStart <= dateStart && dateStart <= eventInfo.dateEnd)
			|| (eventInfo.dateStart <= dateEnd && dateEnd <= eventInfo.dateEnd)
			|| (eventInfo.dateStart >= dateStart && dateEnd >= eventInfo.dateEnd)
			|| (eventInfo.dateStart <= dateStart && dateEnd <= eventInfo.dateEnd)
	}
}
