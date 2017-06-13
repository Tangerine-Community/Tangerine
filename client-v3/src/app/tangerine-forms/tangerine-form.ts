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

}
