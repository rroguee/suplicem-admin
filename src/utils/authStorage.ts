
export function saveAuthSession(data: {
    token: string;
    refreshToken: string;
    expiresAt: number;
  }) {
    localStorage.setItem("auth", JSON.stringify(data));
  }
  
  export function getAuthSession() {
    const value = localStorage.getItem("auth");
    return value ? JSON.parse(value) : null;
  }
  
  export function clearAuthSession() {
    localStorage.removeItem("auth");
  }
  