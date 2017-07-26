import {FormlyFieldConfig} from 'ng-formly';

export class TangerineFormCard {
    id = '';
    title: String = undefined;
    subtitle: String = undefined;
    image: String = undefined;
    images = [];
    avatarImage: String = undefined;
    fields: FormlyFieldConfig;
    showSubmitButton = false;
    model: any = {};
    status = 'INVALID';
    skip =  false;
    logic = '';
}
