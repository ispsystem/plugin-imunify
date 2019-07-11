export const isDevMode = process.env.NODE_ENV !== 'production';
export const endpoint = isDevMode ? 'http://localhost:8000' : '';