export function createLoginJWT({ username, permissions }: {
    username: any;
    permissions: any;
}): any;
export function decodeJWT(token: any): any;
export function verifyJWT(token: any): boolean;
