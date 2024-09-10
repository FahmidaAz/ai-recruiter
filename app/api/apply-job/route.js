import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { jobTitle, company, location, salary, resumeText } = await req.json();

    // Logic to apply for the job (send email, update database, etc.)
    console.log(`Applying for ${jobTitle} at ${company}, ${location}, Salary: ${salary}`);
    console.log('Resume text:', resumeText);

    // Here you could integrate with a job application API or platform, or send a notification.

    return NextResponse.json({ message: `Successfully applied for ${jobTitle} at ${company}` });
  } catch (error) {
    console.error('Error applying for the job:', error);
    return NextResponse.json({ error: 'Failed to apply for the job' }, { status: 500 });
  }
}
