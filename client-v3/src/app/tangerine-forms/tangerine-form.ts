import { PathMap } from './path-map';
import { TangerineFormContext } from './tangerine-form-context';

export class TangerineForm {

    _id: '';
    _rev: '';
    title: '' = '';
    collection: '' = '';
    status: '';
    formSchemaId: '';
    formRevision: '';
    children: Array<any>;
    pathMap: PathMap;

    constructor(formObject) {
        this._id = formObject._id;
        this._rev = formObject._rev;
        this.title = formObject.title;
        this.status = formObject.status;
        this.formSchemaId = formObject.formSchemaId;
        this.formRevision = formObject.formRevision;
        this.children = formObject.children;
        this.pathMap = new PathMap(formObject);
    }

    // Given a path, finds a valid context which includes the closest Page object/path and that Page's Section object/path.
    findContextFromPath(path) {
        const context = new TangerineFormContext;
        // At the beginning? Step forward one.
        if (path === '') {
            path = this.pathMap.pathByIndex[0];
        }
        let i = this.pathMap.indexByPath[path];
        let potentialPagePath = this.pathMap.pathByIndex[i];
        let potentialPageObject = this.pathMap.objectByPath[potentialPagePath];
        while (potentialPageObject.collection !== 'Page') {
            i++;
            potentialPageObject = this.pathMap.objectByPath[this.pathMap.pathByIndex[i]];
            potentialPagePath = this.pathMap.pathByIndex[i];
        }
        if ((i + 1) === this.pathMap.pathByIndex.length) {
            context.isLastPage = true;
        }
        context.pagePath = potentialPagePath;
        context.pageObject = potentialPageObject;
        // TODO: Walk up and find sectionObject and sectionPath.
        return context;
    }

    // Given a path, finds the next valid context which includes a Page object/path and that Page's Section object/path.
    findNextContextFromPath(path) {
        // TODO Safe guard against no next page?
        // At the beginning? Step forward one.
        if (path === '') {
            path = this.pathMap.pathByIndex[0];
        }
        let i = this.pathMap.indexByPath[path];
        i++;
        let obj = this.pathMap.objectByPath[this.pathMap.pathByIndex[i]];
        while (obj.collection !== 'Page') {
            i++;
            obj = this.pathMap.objectByPath[this.pathMap.pathByIndex[i]];
        }
        const context = this.findContextFromPath(this.pathMap.pathByIndex[i]);
        return context;
    }

    // When a result is updated, the sections to skip should be recalculated.
    // TODO: If TangerineForm was fed a TangerineFormResult, TangerineForm could listen for the result update and recalculate the sections to skip
    // instead of having to rely on the TangerineFormComponent to wire it all together carefully. Yet there is something weird about that not being
    // something that gets save to the TangerineForm Model. Perhaps this class is like the controller and there should be a TangerineFormModel Class
    // which would then mean TangerineFormResultModel. It's not quite melding clearly yet.
    //
    // TODO: We also have this assumptiont that sections are skippable but not pages. Not sure it that should maintain. On one hand that seems simpler,
    // on the other it seems like it might want to be able to marked pages as skip.
    calculateSectionsToSkip(variables: object) {
        let pathsToSkip = [];
        pathsToSkip = [];
        this.pathMap.pathByIndex.forEach((path) => {
            const obj = this.pathMap.objectByPath[path];
            if (obj.collection === 'section') {
                let shouldSkip = false;
                shouldSkip = false;
                eval(obj.skipLogic);
                if (shouldSkip) {
                    pathsToSkip.push(path);
                }
            }
        });
        debugger;
        return pathsToSkip;

    }

}
