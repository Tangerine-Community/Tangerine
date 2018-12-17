export class ValidationService {
    static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {//not currently used jw
        let config = {
            'required': 'Required',
            'invalidCreditCard': 'Invalid credit card number',
            'invalidEmailAddress': 'Invalid email address',
            'invalidPassword': 'Make at least 6 characters with a number',
            'passwordsDontMatch': 'Passwords are not matching',
            'invalidCVC': 'Invalid security code (3 digits)',
            'invalidMonth': 'Invalid month (number between 1 and 12)',
            'invalidYear': 'Invalid year (2 digit or 4 digit)',
            'minlength': `Minimum length ${validatorValue.requiredLength}`,
            'stateRequired': 'State is required for billing in the USA',
        };

        return config[validatorName];
    }

    // static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
    //     let config = {
    //         'required': 'Required',
    //         'invalidCreditCard': 'Is invalid credit card number',
    //         'invalidEmailAddress': 'Invalid email address',
    //         'invalidPassword': 'Invalid password. Password must be at least 6 characters long, and contain a number.',
    //         'minlength': `Minimum length ${validatorValue.requiredLength}`
    //     };

    //     return config[validatorName];
    // }

    static creditCardValidator(control) {
        // Visa, MasterCard, American Express, Diners Club, Discover, JCB
        if (control.value.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/)) {
            return null;
        } else {
            return { 'invalidCreditCard': true };
        }
    }

    static emailValidator(control) {
        // RFC 2822 compliant regex
        if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            return null;
        } else {
            return { 'invalidEmailAddress': true };
        }
    }
    
    static cvcValidator(control) {
        // match digit one or more time
        if (control.value.match(/^\d{3}$/)) {
            return null;
        } else {
            return { 'invalidCVC': true };
        }
    }
    
    static monthValidator(control) {
        // match digit one or more time
        if (control.value.match(/(^0[1-9]|1[0-2])|(^[1-9]{1})$/)) { //should get 1,2,3 etc or 01, 02, 03 etc or 10, 11, 12
            return null;
        } else {
            return { 'invalidMonth': true };
        }
    }
    
    static yearValidator(control) {
        // match digit one or more time
        if (control.value.match(/^\d{2}(?:\d{2})?$/)) { //two or 4 digit year
            return null;
        } else {
            return { 'invalidYear': true };
        }
    }

    static passwordValidator(control) {
        // {6,100}           - Assert password is between 6 and 100 characters
        // (?=.*[0-9])       - Assert a string has at least one number
        if (control.value.match(/^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{6,100}$/)) {
            return null;
        } else {
            return { 'invalidPassword': true };
        }
    }

    //static passwordsValidator(pw1: string, pw2: string) {
    //    if (pw1 == pw2) {
    //        return null;
    //    } else {
    //        return { 'passwordsDontMatch': true };
    //    }
    //}
}
