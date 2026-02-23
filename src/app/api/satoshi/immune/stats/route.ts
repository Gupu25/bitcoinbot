import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  
  // Validación simple contra la env var
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid API key' }, 
      { status: 401 }
    );
  }

  // Si la key es válida, devuelve stats básicas
  return NextResponse.json({
    status: 'immune_system_active',
    timestamp: Date.now(),
    node: 'satoshi-core',
    threat_level: 'low',
    message: 'Access granted'
  });
}
