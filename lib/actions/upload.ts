'use server';

import { put } from '@vercel/blob';
import { auth } from '@clerk/nextjs/server';

/**
 * Upload image to Vercel Blob Storage
 * @param formData FormData containing the image file
 * @returns The uploaded image URL
 */
export async function uploadImage(formData: FormData): Promise<string> {
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized: Please sign in to upload images');
  }

  const file = formData.get('image') as File;
  if (!file) {
    throw new Error('No image file provided');
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file type. Please upload an image file.');
  }

  // Validate file size (max 10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 10MB limit. Please upload a smaller image.');
  }

  try {
    // Generate unique filename with timestamp and user ID
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filename = `meals/${userId}/${timestamp}.${fileExtension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    });

    return blob.url;
  } catch (error) {
    console.error('Error uploading image to Vercel Blob:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
}

