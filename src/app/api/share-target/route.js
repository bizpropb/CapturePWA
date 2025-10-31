import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Share Target API Handler
 * Receives shared content from other apps via the Web Share Target API
 *
 * This endpoint is called when users share content to this PWA from other apps
 * (e.g., sharing a photo from the gallery, sharing text from a browser)
 */

// Temporary in-memory store for shared data (in production, use Redis or database)
const shareCache = new Map();

// Clean up old shares after 10 minutes
const SHARE_EXPIRY = 10 * 60 * 1000;

export async function POST(request) {
  try {
    // Parse the multipart form data
    const formData = await request.formData();

    const title = formData.get('title') || '';
    const text = formData.get('text') || '';
    const url = formData.get('url') || '';
    const mediaFile = formData.get('media');

    console.log('📥 Share Target received:', {
      title,
      text,
      url,
      hasMedia: !!mediaFile,
      mediaType: mediaFile?.type
    });

    // Generate a unique share session ID
    const shareId = uuidv4();

    // Prepare share data
    const shareData = {
      title,
      text,
      url,
      timestamp: Date.now()
    };

    // If media file is shared, save it temporarily
    if (mediaFile) {
      const bytes = await mediaFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create temp directory if it doesn't exist
      const tempDir = path.join(process.cwd(), 'temp', 'shares');
      await mkdir(tempDir, { recursive: true });

      // Generate unique filename
      const fileExtension = mediaFile.name.split('.').pop() || 'bin';
      const fileName = `${shareId}.${fileExtension}`;
      const filePath = path.join(tempDir, fileName);

      // Save file temporarily
      await writeFile(filePath, buffer);

      shareData.media = {
        fileName,
        filePath,
        type: mediaFile.type,
        size: mediaFile.size,
        originalName: mediaFile.name
      };

      console.log('💾 Saved shared media:', fileName);
    }

    // Store share data in cache
    shareCache.set(shareId, shareData);

    // Schedule cleanup
    setTimeout(() => {
      shareCache.delete(shareId);
      console.log('🗑️ Cleaned up expired share:', shareId);
    }, SHARE_EXPIRY);

    // Redirect to capture page with share ID
    const captureUrl = new URL('/capture', request.url);
    captureUrl.searchParams.set('shareId', shareId);

    return NextResponse.redirect(captureUrl, 303);

  } catch (error) {
    console.error('❌ Share Target error:', error);

    // Redirect to capture page even on error
    const captureUrl = new URL('/capture', request.url);
    captureUrl.searchParams.set('error', 'share-failed');

    return NextResponse.redirect(captureUrl, 303);
  }
}

/**
 * GET endpoint to retrieve shared data by share ID
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      );
    }

    const shareData = shareCache.get(shareId);

    if (!shareData) {
      return NextResponse.json(
        { error: 'Share not found or expired' },
        { status: 404 }
      );
    }

    // If there's media, read the file and convert to base64
    if (shareData.media) {
      const fs = await import('fs/promises');
      const fileBuffer = await fs.readFile(shareData.media.filePath);
      const base64 = fileBuffer.toString('base64');
      const dataUrl = `data:${shareData.media.type};base64,${base64}`;

      shareData.media.dataUrl = dataUrl;

      // Clean up the temp file after reading
      fs.unlink(shareData.media.filePath).catch(console.error);
    }

    // Remove from cache after retrieval (one-time use)
    shareCache.delete(shareId);

    return NextResponse.json(shareData);

  } catch (error) {
    console.error('❌ Share retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve share data' },
      { status: 500 }
    );
  }
}
