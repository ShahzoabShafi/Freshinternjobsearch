//Step 1 for auth: Token Storage Module--------------------------------
const ACCESS_KEY = "mh_access_token"
const REFRESH_KEY = "mh_refresh_token"

export function setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS_KEY, accessToken)
    localStorage.setItem(REFRESH_KEY, refreshToken)

}

export function getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY) 
}

export function getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY)
}

export function clearTokens() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
}
