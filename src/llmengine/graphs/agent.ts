import { ToolNode } from '@langchain/langgraph/prebuilt';

import {
  END,
  MessagesAnnotation,
  START,
  StateGraph
} from "@langchain/langgraph";

import { SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { tools } from '../tools/recruitment';

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
  const currentTime = new Date().toISOString();
  messages.unshift(new SystemMessage(`The current time is ${currentTime}. You are a helpful assistant that can help with recruitment tasks. USE BAHASA INDONESIA.`));
  const response = await modelWithTools.invoke(messages);
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