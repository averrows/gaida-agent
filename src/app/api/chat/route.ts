import { ChatOpenAI } from "@langchain/openai";
import { NextResponse } from "next/server";
import { agent } from "@/llmengine/graphs/agent";

export const maxDuration = 60;
export async function POST(req: Request) {
  const { messages } = await req.json();
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
  });

  const response = await agent.invoke({
    messages: messages,
  });
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // for await (const chunk of response) {
      //   let contentChunk: string = chunk.output;
      //   console.log(chunk);
      //   console.log(contentChunk);
      //   const escapedChunk = contentChunk.replace(/\n/g, '\\n');
      //   controller.enqueue(encoder.encode(`0:"${escapedChunk}"\n`));
      // }
      const messages = response.messages;
      console.log(messages);
      const lastMessage = messages[messages.length - 1];
      const content = lastMessage.content.toString();
      const escapedChunk = content.replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\f/g, '\\f').replace(/\v/g, '\\v').replace(/'/g, "\\'").replace(/"/g, '\\"');
      console.log(escapedChunk);
      controller.enqueue(encoder.encode(`0:"${escapedChunk}"`));
      console.log(encoder.encode(`0:"${escapedChunk}"`));
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

// export async function POST(req: Request) {
//   const { messages } = await req.json();

//   const result = streamText({
//     model: openai('gpt-4-turbo'),
//     system: 'You are a helpful assistant.',
//     messages,
//   });

//   return result.toDataStreamResponse();
// }
