import formidable from 'formidable';
import { NextResponse } from 'next/server';
import fs from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export const dynamicParams = true; // New way to configure the route

// Helper function for parsing form data
const readFile = (req) =>
  new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });

export async function POST(req) {
  try {
    const { files } = await readFile(req);
    const file = files.file;

    let resumeText = '';

    if (file.mimetype === 'application/pdf') {
      const fileBuffer = fs.readFileSync(file.filepath);
      const parsedPdf = await pdf(fileBuffer);
      resumeText = parsedPdf.text;
    } else if (
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'application/msword'
    ) {
      const fileBuffer = fs.readFileSync(file.filepath);
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      resumeText = result.value;
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF or DOCX file.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ resumeText }, { status: 200 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}
