import { ChatOpenAI } from "@langchain/openai";
import { NextResponse } from "next/server";
import { StringOutputParser } from "@langchain/core/output_parsers";
export async function POST(req: Request) {
  const { messages } = await req.json();
  const model = new ChatOpenAI({
    modelName: "gpt-4o",
  });

  const chain = model.pipe(new StringOutputParser());
  const response = await chain.stream(messages);

  return new Response(response, {
    headers: {
      'Content-Type': '"text/plain; charset=utf-8"',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Transfer-Encoding': 'chunked'
    }
  });
}
