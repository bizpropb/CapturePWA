import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST /api/upload
 * Upload a file (image, audio, or video) to Cloudinary
 * Expects multipart/form-data with a 'file' field and optional 'type' field
 */
export async function POST(request) {
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary not configured. Please add credentials to .env file.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type') || 'auto'; // 'image', 'audio', 'video', or 'auto'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 100MB for video, 10MB for others)
    const isVideo = type === 'video' || file.type.startsWith('video/');
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for video, 10MB for others

    if (file.size > maxSize) {
      const maxSizeStr = isVideo ? '100MB' : '10MB';
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSizeStr}.` },
        { status: 400 }
      );
    }

    // Convert file to base64 data URI
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type;
    const dataURI = `data:${mimeType};base64,${base64}`;

    // Determine resource type and folder
    let resourceType = 'auto';
    let folder = 'moments';

    if (type === 'image' || mimeType.startsWith('image/')) {
      resourceType = 'image';
      folder = 'moments/images';
    } else if (type === 'audio' || mimeType.startsWith('audio/')) {
      resourceType = 'video'; // Cloudinary uses 'video' for audio files
      folder = 'moments/audio';
    } else if (type === 'video' || mimeType.startsWith('video/')) {
      resourceType = 'video';
      folder = 'moments/videos';
    }

    // Upload to Cloudinary
    const uploadOptions = {
      folder: folder,
      resource_type: resourceType,
      transformation: resourceType === 'image' ? [
        { width: 1000, height: 1000, crop: 'limit' }, // Limit image size
        { quality: 'auto' },
      ] : undefined,
      // For videos, add timeout and chunk size
      timeout: resourceType === 'video' && type === 'video' ? 120000 : undefined, // 2 minutes for video
    };

    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error.message },
      { status: 500 }
    );
  }
}
