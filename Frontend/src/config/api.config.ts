export const API_CONFIG = {
  baseURL: (process.env.NEXT_PUBLIC_API_URL || "https://academic-portal-16620c77.fastapicloud.dev") + '/api/v1',
  timeout: 10000,
  endpoints: {
    auth: {
      login: '/auth/login',
      validate: '/auth/validate-token'
    },
    profile: {
      me: '/profile/me'
    }
  }
};