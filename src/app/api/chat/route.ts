import { ChatOpenAI } from "@langchain/openai";
import { NextResponse } from "next/server";
import { StringOutputParser } from "@langchain/core/output_parsers";
export async function POST(req: Request) {
  const { messages } = await req.json();
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
  });

  const chain = model.pipe(new StringOutputParser());
  const response = await chain.stream(messages);


  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const escapedChunk = chunk.replace(/\n/g, '\\n');
        controller.enqueue(encoder.encode(`0:"${escapedChunk}"\n`));
      }
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// import { openai } from '@ai-sdk/openai';
// import { streamText } from 'ai';

// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30;

// export async function POST(req: Request) {
//   const { messages } = await req.json();

//   const result = streamText({
//     model: openai('gpt-4-turbo'),
//     system: 'You are a helpful assistant.',
//     messages,
//   });

//   return result.toDataStreamResponse();
// }
