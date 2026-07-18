import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const formData = new URLSearchParams();
    formData.append('username', body.username);
    formData.append('password', body.password);

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://academic-portal-16620c77.fastapicloud.dev";
    
    const backendRes = await fetch(`${backendUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    const data = await backendRes.json();
    
    if (!backendRes.ok) {
      return NextResponse.json(
        { detail: data.detail || 'Invalid credentials' }, 
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data);
    
  } catch (error) {
    return NextResponse.json({ detail: "Internal Server Error" }, { status: 500 });
  }
}