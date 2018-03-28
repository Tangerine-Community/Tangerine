export interface User {
    username: string;
    password: string;
    confirmPassword?: string;
    securityQuestionResponse: string;
    hashSecurityQuestion: boolean;
}
