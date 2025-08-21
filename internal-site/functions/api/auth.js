export async function onRequestPost(context) {
  try {
    const { password } = await context.request.json();
    
    if (password === 'piss') {
      return Response.json({ success: true }, {
        headers: {
          'Set-Cookie': 'auth_token=simple_auth_token; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/'
        }
      });
    } else {
      return Response.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    return Response.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}