'use server';
/**
 * @fileOverview This file defines a Genkit flow for drafting AI automation workflows.
 *
 * - draftAIWorkflow - A function that generates an initial draft of an AI automation workflow (nodes and edges) based on a natural language description.
 * - AIWorkflowDraftingInput - The input type for the draftAIWorkflow function.
 * - AIWorkflowDraftingOutput - The return type for the draftAIWorkflow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Input schema for the AI workflow drafting flow.
 * It expects a natural language description of the desired automation.
 */
const AIWorkflowDraftingInputSchema = z.object({
  description: z
    .string()
    .describe('A natural language description of the desired AI automation workflow.'),
});
export type AIWorkflowDraftingInput = z.infer<typeof AIWorkflowDraftingInputSchema>;

/**
 * Schema for the data field within a node, including a display label and optional configuration.
 */
const NodeDataSchema = z
  .object({
    label: z.string().describe('Display label for the node on the canvas.'),
    config: z
      .record(z.any())
      .optional()
      .describe(
        'Configuration object specific to the node type. E.g., { "query": "AI news" } for a web scraper, { "model": "gemini-1.5-flash", "instruction": "summarize the text" } for an AI processor, or { "to": "user@example.com", "subject": "AI News Summary" } for an email sender.'
      ),
  })
  .passthrough(); // Allows for additional, unspecified properties in the data object.

/**
 * Schema for a single node in a React Flow canvas.
 */
const NodeSchema = z
  .object({
    id: z.string().describe('Unique identifier for the node.'),
    type: z
      .enum([
        'input',
        'output',
        'ai_processor',
        'web_scraper',
        'email_sender',
        'twitter_poster',
        'data_filter',
        'condition',
        'timer',
        'code_executor',
        'http_request'
      ])
      .describe('The type of the node, indicating its function.'),
    position: z
      .object({
        x: z.number().describe('X coordinate on the canvas.'),
        y: z.number().describe('Y coordinate on the canvas.'),
      })
      .describe('Position of the node on the canvas.'),
    data: NodeDataSchema.describe('Node-specific data and configuration.'),
  })
  .describe('A node in the React Flow canvas.');

/**
 * Schema for a single edge connecting two nodes in a React Flow canvas.
 */
const EdgeSchema = z
  .object({
    id: z.string().describe('Unique identifier for the edge.'),
    source: z.string().describe('The ID of the source node.'),
    target: z.string().describe('The ID of the target node.'),
    sourceHandle: z
      .string()
      .optional()
      .describe('Optional: The handle ID on the source node (e.g., "output-0").'),
    targetHandle: z
      .string()
      .optional()
      .describe('Optional: The handle ID on the target node (e.g., "input-0").'),
  })
  .describe('An edge connecting two nodes in the React Flow canvas.');

/**
 * Output schema for the AI workflow drafting flow.
 * It represents a complete workflow draft with an array of nodes and edges.
 */
const AIWorkflowDraftingOutputSchema = z
  .object({
    nodes: z.array(NodeSchema).describe('An array of nodes representing the workflow.'),
    edges: z.array(EdgeSchema).describe('An array of edges connecting the nodes.'),
  })
  .describe('A draft of an AI automation workflow, structured for a node-based canvas.');
export type AIWorkflowDraftingOutput = z.infer<typeof AIWorkflowDraftingOutputSchema>;

/**
 * Defines the prompt for the AI workflow drafting. It instructs the LLM to generate
 * a structured JSON output representing a React Flow canvas based on a natural language description.
 */
const prompt = ai.definePrompt({
  name: 'aiWorkflowDraftingPrompt',
  input: {schema: AIWorkflowDraftingInputSchema},
  output: {schema: AIWorkflowDraftingOutputSchema},
  prompt: `You are an expert AI workflow designer. Your task is to generate a draft of an AI automation workflow based on a natural language description.
The output must be a JSON object conforming strictly to the AIWorkflowDraftingOutputSchema.
The workflow should consist of nodes and edges, suitable for a node-based canvas editor like React Flow.

When generating the workflow:
1.  **Nodes**: Each node must have a unique 'id', a valid 'type' from the enum, 'position' (x, y coordinates – lay them out logically, e.g., left to right, top to bottom), and 'data'.
    *   The 'data' object requires a 'label' for display on the node.
    *   The 'data' object may also include a 'config' object containing relevant parameters for that node type. Populate 'config' with reasonable default values or placeholders based on the description.
    *   Node types and their common uses:
        *   'input': Starting point, e.g., web scraper, user trigger.
        *   'ai_processor': Performs AI tasks like summarization, classification, generation.
        *   'data_filter': Filters data based on conditions.
        *   'condition': Branches the workflow based on true/false.
        *   'timer': Triggers at specific intervals.
        *   'code_executor': Runs custom code.
        *   'http_request': Makes API calls.
        *   'email_sender': Sends emails.
        *   'twitter_poster': Posts to Twitter.
        *   'output': Final destination or action.
2.  **Edges**: Each edge must have a unique 'id', 'source' node ID, and 'target' node ID. 'sourceHandle' and 'targetHandle' are optional but can be used if specific connection points on a node are needed.

Example for "Monitor news for 'AI' and send a summary to my email":
{
  "nodes": [
    {
      "id": "node-1",
      "type": "web_scraper",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "Scrape AI News",
        "config": {
          "url": "https://news.google.com/search?q=AI",
          "query": "AI"
        }
      }
    },
    {
      "id": "node-2",
      "type": "ai_processor",
      "position": { "x": 400, "y": 100 },
      "data": {
        "label": "Summarize News",
        "config": {
          "model": "gemini-1.5-flash",
          "instruction": "Summarize the following news article into 3 key bullet points."
        }
      }
    },
    {
      "id": "node-3",
      "type": "email_sender",
      "position": { "x": 700, "y": 100 },
      "data": {
        "label": "Send Email Summary",
        "config": {
          "to": "user@example.com",
          "subject": "Daily AI News Summary"
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1-2",
      "source": "node-1",
      "target": "node-2"
    },
    {
      "id": "edge-2-3",
      "source": "node-2",
      "target": "node-3"
    }
  ]
}

Description: {{{description}}}

Please generate the JSON output based on the description:
`,
});

/**
 * Defines the Genkit flow for drafting AI automation workflows.
 * It uses the 'aiWorkflowDraftingPrompt' to generate the workflow structure.
 */
const aiWorkflowDraftingFlow = ai.defineFlow(
  {
    name: 'aiWorkflowDraftingFlow',
    inputSchema: AIWorkflowDraftingInputSchema,
    outputSchema: AIWorkflowDraftingOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate workflow draft.');
    }
    return output;
  }
);

/**
 * Public wrapper function to call the AI workflow drafting flow.
 * @param input - The natural language description of the desired workflow.
 * @returns A promise that resolves to the drafted AI workflow (nodes and edges).
 */
export async function draftAIWorkflow(
  input: AIWorkflowDraftingInput
): Promise<AIWorkflowDraftingOutput> {
  return aiWorkflowDraftingFlow(input);
}
