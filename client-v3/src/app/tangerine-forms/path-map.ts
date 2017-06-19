// A utility for flattening an object tree into a series of paths.
export class PathMap {

    // Helpful stuff for doing path calculations.
    objectByPath: object = {};
    pathByIndex: Array<any> = [];
    indexByPath: object = {};

    constructor(tree: any) {
        let path = '';
        let i = 0;
        const that = this;
        function indexChildren(parent) {
            // step forward path
            path += `/${parent._id}`;
            that.pathByIndex.push(path);
            if (parent.children && parent.children.length > 0) {
                parent.children.forEach(element => {
                    that.objectByPath[path + '/' + element._id] = element;
                    that.indexByPath[path + '/' + element._id] = i;
                    i++;
                    indexChildren(element);
                });
            }
            // step back path
            const pathFragments = path.split('\/');
            pathFragments.pop();
            path = pathFragments.join('/');
        }
        indexChildren(tree);
        this.pathByIndex.shift();
    }

}
