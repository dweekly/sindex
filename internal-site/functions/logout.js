export async function onRequestGet(context) {
  return new Response('', {
    status: 302,
    headers: {
      'Location': '/',
      'Set-Cookie': 'auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/'
    }
  });
}