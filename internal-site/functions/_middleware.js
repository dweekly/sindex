export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  // Allow API endpoints, login page, logout, and robots.txt
  if (url.pathname.startsWith('/api/') || 
      url.pathname === '/' || 
      url.pathname === '/logout' ||
      url.pathname === '/robots.txt') {
    return next();
  }
  
  // Check authentication for protected routes
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader || !cookieHeader.includes('auth_token=simple_auth_token')) {
    return Response.redirect(new URL('/', request.url), 302);
  }
  
  return next();
}