export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/comics', '/comics/constructor'],
};
