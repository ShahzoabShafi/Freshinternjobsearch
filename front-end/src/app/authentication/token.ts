//Step 2 for auth: Token Decode Helper (reads whats inside the access token)
import {jwtDecode} from 'jwt-decode'

export interface TokenPayload{
    sub: string;
    role:  string;
    exp: number; // seconds
}

export function decodeToken(token : string) : TokenPayload | null{
    try {
        return jwtDecode(token) as TokenPayload;
    } catch (error) {
        return null
    }    
}

export function isTokenExpired(token : string) : boolean {
    const tokenPayload = decodeToken(token)
    if (!tokenPayload){
        return true
    }
    const expiry = tokenPayload.exp // seconds
    const now = Date.now() // milliseconds
    const isExpired : boolean = expiry <  (now / 1000 + 10)

    return isExpired
}

export function getRole(token : string) : string | null {
    const tokenPayload = decodeToken(token)
    if (!tokenPayload){
        return null
    }
    const role = tokenPayload.role
    return role
}


