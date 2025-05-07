import 'dotenv/config';
import { put } from '@vercel/blob';
import fs from 'fs';

async function testBlobUpload() {
  console.log('BLOB_READ_WRITE_TOKEN available:', !!process.env.BLOB_READ_WRITE_TOKEN);
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('Error: BLOB_READ_WRITE_TOKEN not set in environment');
    return;
  }
  
  try {
    // Create a simple test file
    const testData = Buffer.from('Test file for Vercel Blob upload');
    
    console.log('Uploading test file to Vercel Blob...');
    const blob = await put('test-file.txt', testData, {
      access: 'public',
    });
    
    console.log('Blob upload success!');
    console.log('URL:', blob.url);
    console.log('Pathname:', blob.pathname);
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
  }
}

testBlobUpload(); 