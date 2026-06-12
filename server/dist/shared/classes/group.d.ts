type doc_id = string;
export interface Group {
    _id: doc_id;
    label: string;
    created: string;
    config: any;
    roles: any[];
}
export {};
