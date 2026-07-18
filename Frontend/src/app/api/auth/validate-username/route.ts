import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Replace with your actual environment variable if different
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://academic-portal-16620c77.fastapicloud.dev';
    
    const res = await fetch(`${backendUrl}/api/v1/auth/validate-username`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Validate username proxy error:", error);
    return NextResponse.json(
      { message: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}