import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const { path } = resolvedParams;
  
  if (!path || !Array.isArray(path)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }
  
  const pathString = path.join('/');
  const targetUrl = `https://api.football-data.org/${pathString}`;
  
  try {
    const res = await fetch(targetUrl, {
      headers: {
        'X-Auth-Token': process.env.NEXT_PUBLIC_FOOTBALL_DATA_API_KEY
      },
      // Revalidate/cache the response every 3600 seconds (1 hour)
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: `API responded with status: ${res.status}` }, { status: res.status });
    }
    
    const data = await res.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Failed to proxy football-data API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
