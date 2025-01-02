import { StringOutputParser, StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { ToolNode } from '@langchain/langgraph/prebuilt';


import {
  Annotation,
  StateGraph,
  MessagesAnnotation,
  END,
  START
} from "@langchain/langgraph";

import { tools } from '../tools/linkedin';
import { ChatOpenAI } from "@langchain/openai";

const toolNodeForGraph = new ToolNode(tools)


const modelWithTools = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0,
}).bindTools(tools)

const shouldContinue = (state: typeof MessagesAnnotation.State) => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  console.log(lastMessage);
  if ("tool_calls" in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls?.length) {
    return "tools";
  }
  return END;
}

const callModel = async (state: typeof MessagesAnnotation.State) => {
  const { messages } = state;
  const response = await modelWithTools.invoke(messages);
  return { messages: response };
}


const workflow = new StateGraph(MessagesAnnotation)
  // Define the two nodes we will cycle between
  .addNode("agent", callModel)
  .addNode("tools", toolNodeForGraph)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", shouldContinue, ["tools", END])
  .addEdge("tools", "agent")
  .addEdge("agent", END);

export const agent = workflow.compile()