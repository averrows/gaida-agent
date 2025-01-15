import { ToolNode } from '@langchain/langgraph/prebuilt';

import {
  END,
  MessagesAnnotation,
  START,
  StateGraph
} from "@langchain/langgraph";

import { SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { ChatOllama } from "@langchain/ollama";
// import { tools } from '../tools/recruitment';
import { tools } from '../tools/gaidasolver';

const toolNodeForGraph = new ToolNode(tools)


const modelWithTools = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0,
}).bindTools(tools)

const ollamaModelWithTools = new ChatOllama({
  model: "command-r7b",
  temperature: 0,
}).bindTools(tools)

// LLAMA3.2
// 1. Can't use tool with wrong prompt. It can't properly rephrasing the prompt to be input parameter for tool.

const shouldContinue = (state: typeof MessagesAnnotation.State) => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  if ("tool_calls" in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls?.length) {
    console.log(lastMessage.tool_calls);
    return "tools";
  }
  return END;
}

const callModel = async (state: typeof MessagesAnnotation.State) => {
  const { messages } = state;
  const currentTime = new Date().toISOString();
  messages.unshift(new SystemMessage(`The current time is ${currentTime}. You are a helpful assistant that help customer service to answer customer's question. USE BAHASA INDONESIA.
    If user ask something general and unrelated Telkomsel product or procedure, answer with "Maaf, saya hanya dapat menjawab pertanyaan yang berkaitan dengan produk Telkomsel. Silakan ajukan pertanyaan yang sesuai dengan produk Telkomsel."`));
  const response = await ollamaModelWithTools.invoke(messages);
  return { messages: response };
}


const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNodeForGraph)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", shouldContinue, ["tools", END])
  .addEdge("tools", "agent")
  .addEdge("agent", END);

export const agent = workflow.compile()