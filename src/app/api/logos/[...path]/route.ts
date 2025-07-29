import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const logoPath = resolvedParams.path.join('/');
    const filePath = path.join(process.cwd(), 'public', 'logos', logoPath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse('Logo not found', { status: 404 });
    }
    
    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Return the file with proper headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving logo:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 