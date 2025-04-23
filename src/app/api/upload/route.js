import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  const uploadDir = path.join(process.cwd(), '/public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const contentType = request.headers.get('content-type') || '';
  const contentLength = request.headers.get('content-length') || '';

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    multiples: false,
  });

  const req = Object.assign(Readable.fromWeb(request.body), {
    headers: {
      'content-type': contentType,
      'content-length': contentLength,
    },
    method: 'POST',
    url: '',
  });

  try {
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const file = files.image;
    return NextResponse.json(
      {
        message: 'File uploaded successfully',
        imageUrl: `/uploads/${file[0]?.newFilename}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'File upload failed', details: error.message },
      { status: 500 }
    );
  }
}
