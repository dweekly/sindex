export async function onRequestGet(context) {
  // Check for simple auth token
  const cookieHeader = context.request.headers.get('Cookie');
  if (!cookieHeader || !cookieHeader.includes('auth_token=simple_auth_token')) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }
  
  const tracks = [
    {
      id: 'chasing-the-clouds-away',
      title: 'Chasing the Clouds Away',
      artist: 'Original',
      duration: '3:46',
      trackNumber: 1
    },
    {
      id: 'lovely-day-with-aly',
      title: 'Lovely Day (with Aly)',
      artist: 'Bill Withers (cover)',
      duration: '3:35',
      trackNumber: 2
    },
    {
      id: 'the-letter',
      title: 'The Letter',
      artist: 'The Box Tops (cover)',
      duration: '3:35',
      trackNumber: 3
    },
    {
      id: 'keep-me-in-mind',
      title: 'Keep Me in Mind',
      artist: 'Original',
      duration: '3:06',
      trackNumber: 4
    },
    {
      id: 'i-am-a-good-woman',
      title: 'I Am a Good Woman',
      artist: 'Original',
      duration: '2:55',
      trackNumber: 5
    },
    {
      id: 'come-on-come-over',
      title: 'Come On Come Over',
      artist: 'Jaco Pastorius (cover)',
      duration: '4:34',
      trackNumber: 6
    },
    {
      id: 'dream-come-true',
      title: 'Dream Come True',
      artist: 'Original',
      duration: '4:52',
      trackNumber: 7
    },
    {
      id: 'who-knows-who',
      title: 'Who Knows Who',
      artist: 'Original',
      duration: '4:04',
      trackNumber: 8
    },
    {
      id: 'just-dropped-in',
      title: 'Just Dropped In',
      artist: 'Kenny Rogers (cover)',
      duration: '3:36',
      trackNumber: 9
    },
    {
      id: 'mercy',
      title: 'Mercy',
      artist: 'Original',
      duration: '3:03',
      trackNumber: 10
    },
    {
      id: 'como-ves',
      title: 'Como Ves',
      artist: 'Original',
      duration: '4:28',
      trackNumber: 11
    },
    {
      id: 'knock-yourself-out',
      title: 'Knock Yourself Out',
      artist: 'Original',
      duration: '5:46',
      trackNumber: 12
    },
    {
      id: 'proud-mary-finale',
      title: 'Proud Mary (Finale)',
      artist: 'CCR (cover)',
      duration: '5:28',
      trackNumber: 13
    }
  ];
  
  return Response.json({ 
    success: true, 
    tracks: tracks,
    r2BaseUrl: 'https://cdn.sinister-dexter.com/unreleased/2025-08-20-Music-In-The-Park/'
  });
}