import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const systemPrompt = `You are a Job Recruitment assistant designed to help candidates find job openings based on their query. For every user question, you will return information on the top 3 jobs that match the query from the Pinecone database. If a question pertains to job positions not included in the Pinecone database, politely inform the user that no information is available. Do not provide any job recommendations outside of the jobs listed in the database. If a user asks a question that is unrelated to job searching, respond with a polite message indicating that you can only assist with job-related inquiries.Your primary goal is to help candidates by providing accurate and relevant information about jobs based on the available data. Ensure that all responses are concise, helpful, and focused on the user's career needs.`;

export async function POST(req) {
  const data = await req.json();

  // Initialize Pinecone and OpenAI
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const index = pc.index('job-index').namespace('jobs-namespace');
  const openai = new OpenAI();

  // Extract user query (which may contain the job position)
  const text = data[data.length - 1].content;

  // Create text embedding using OpenAI (to represent the query)
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    encoding_format: 'float',
  });

  // Query Pinecone database using the embedding and filter by "Job Position"
  const results = await index.query({
    topK: 3, // Return the top 3 job matches
    includeMetadata: true,
    vector: embedding.data[0].embedding,
    filter: {
      "Job Position": { "$eq": text }, // Add a filter to match the job position exactly
    },
  });

  // Format the results into a readable string
  let resultString = '';
  results.matches.forEach((match) => {
    resultString += `
    Returned Results:
    Job Position: ${match.metadata['Job Position']}
    Company: ${match.metadata.company}
    Location: ${match.metadata.location}
    Salary: ${match.metadata.salary}
    \n\n`;
  });

  // Construct the response content
  const lastMessage = data[data.length - 1];
  const lastMessageContent = lastMessage.content + resultString;
  const lastDataWithoutLastMessage = data.slice(0, data.length - 1);

  // Generate a completion response using OpenAI chat model
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      ...lastDataWithoutLastMessage,
      { role: 'user', content: lastMessageContent },
    ],
    model: 'gpt-4o',
    stream: true,
  });

  // Stream the response back to the client
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
