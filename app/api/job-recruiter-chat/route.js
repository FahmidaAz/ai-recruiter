import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import jobs from '../../../jobs.json';  // Adjust the path to where your jobs.json is located
import OpenAI from 'openai';

// Pinecone and OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const data = await req.json();
    const userMessage = data[data.length - 1].content.toLowerCase();

    // Query Pinecone or use jobs.json to find matching jobs
    const results = jobs.jobs.filter((job) =>
      job["Job Position"].toLowerCase().includes(userMessage)
    );

    // If jobs are found, structure the response with job details
    if (results.length > 0) {
      let resultString = 'Here are some job positions based on your query:\n\n';
      results.forEach((job) => {
        resultString += `Job Position: ${job["Job Position"]}\nCompany: ${job["Company"]}\nLocation: ${job["Location"]}\nSalary: ${job["Salary"]}\n\n`;
      });

      return NextResponse.json({
        role: 'assistant',
        content: resultString,
      });
    } else {
      return NextResponse.json({
        role: 'assistant',
        content: 'No matching jobs were found for your query.',
      });
    }
  } catch (error) {
    console.error('Error fetching job data:', error);
    return NextResponse.json({ error: 'Failed to retrieve job data' }, { status: 500 });
  }
}
