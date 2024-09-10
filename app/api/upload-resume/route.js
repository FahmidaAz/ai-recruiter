import { NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Disable bodyParser for file uploads
  },
};

// Helper function to handle file reading using formidable
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
    // Read the uploaded file using formidable
    const { files } = await readFile(req);
    const file = files.file;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded. Please upload a file.' },
        { status: 400 }
      );
    }

    let resumeText = '';

    // Handle PDF files
    if (file.mimetype === 'application/pdf') {
      const fileBuffer = fs.readFileSync(file.filepath);
      const parsedPdf = await pdf(fileBuffer);
      resumeText = parsedPdf.text;
    }
    // Handle DOCX files (and related MIME types)
    else if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'application/msword'
    ) {
      const fileBuffer = fs.readFileSync(file.filepath);
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      resumeText = result.value;
    } 
    // Unsupported file types
    else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF or DOCX file.' },
        { status: 400 }
      );
    }

    // Return the extracted resume text
    return NextResponse.json({ resumeText }, { status: 200 });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}
