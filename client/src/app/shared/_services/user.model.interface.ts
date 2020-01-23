export interface User {
    key: string;
    username: string;
    password: string;
    confirmPassword?: string;
    securityQuestionResponse: string;
    hashSecurityQuestionResponse: boolean;
}
