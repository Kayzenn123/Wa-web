'use server';

/**
 * @fileOverview This file implements a Genkit flow for an AI Orchestration Tool.
 * It allows users to define a high-level goal in natural language, and the AI
 * dynamically determines and executes a sequence of available nodes (simulated as Genkit tools)
 * to achieve that goal, adapting to the current data and context.
 *
 * - aiOrchestratedWorkflowExecution - The main function to trigger the AI-orchestrated workflow.
 * - AIOrchestratedWorkflowExecutionInput - The input type for the workflow.
 * - AIOrchestratedWorkflowExecutionOutput - The return type for the workflow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// --- Tool Schemas ---

const WebScrapeInputSchema = z.object({
  url: z.string().url().describe('The URL to scrape content from.'),
});
export type WebScrapeInput = z.infer<typeof WebScrapeInputSchema>;

const WebScrapeOutputSchema = z.object({
  content: z.string().describe('The scraped text content from the URL.'),
});
export type WebScrapeOutput = z.infer<typeof WebScrapeOutputSchema>;

const TextSummarizationInputSchema = z.object({
  text: z.string().describe('The text content to summarize.'),
  length: z.enum(['short', 'medium', 'long']).default('medium').describe('Desired length of the summary.'),
});
export type TextSummarizationInput = z.infer<typeof TextSummarizationInputSchema>;

const TextSummarizationOutputSchema = z.object({
  summary: z.string().describe('The summarized text.'),
});
export type TextSummarizationOutput = z.infer<typeof TextSummarizationOutputSchema>;

const ImageGenerationInputSchema = z.object({
  prompt: z.string().describe('A descriptive prompt for the image to be generated.'),
});
export type ImageGenerationInput = z.infer<typeof ImageGenerationInputSchema>;

const ImageGenerationOutputSchema = z.object({
  imageUrl: z.string().url().describe('The data URI of the generated image.'),
});
export type ImageGenerationOutput = z.infer<typeof ImageGenerationOutputSchema>;

const SocialMediaPostInputSchema = z.object({
  platform: z.string().describe('The social media platform (e.g., "Twitter", "Facebook").'),
  message: z.string().describe('The message to post.'),
  imageUrl: z.string().url().optional().describe('Optional data URI of an image to attach.'),
});
export type SocialMediaPostInput = z.infer<typeof SocialMediaPostInputSchema>;

const SocialMediaPostOutputSchema = z.object({
  status: z.enum(['success', 'failed']).describe('The status of the social media post operation.'),
  postId: z.string().optional().describe('The ID of the created post, if successful.'),
  message: z.string().optional().describe('A descriptive message about the post operation.'),
});
export type SocialMediaPostOutput = z.infer<typeof SocialMediaPostOutputSchema>;

// --- Tools Definitions ---

const webScrapeTool = ai.defineTool(
  {
    name: 'webScrape',
    description: 'Scrapes the text content from a given URL.',
    inputSchema: WebScrapeInputSchema,
    outputSchema: WebScrapeOutputSchema,
  },
  async (input) => {
    console.log(`Executing webScrape tool for URL: ${input.url}`);
    // In a real application, this would fetch and parse the URL content.
    return { content: `Simulated content from ${input.url}: This is a sample paragraph scraped from the internet. It discusses various topics related to technology and AI automation. Users are interested in building workflows.` };
  }
);

const summarizeTextTool = ai.defineTool(
  {
    name: 'summarizeText',
    description: 'Summarizes a given text content to a specified length.',
    inputSchema: TextSummarizationInputSchema,
    outputSchema: TextSummarizationOutputSchema,
  },
  async (input) => {
    console.log(`Executing summarizeText tool for text of length ${input.text.length} and desired length: ${input.length}`);
    const { output } = await ai.generate({
      model: ai.model('googleai/gemini-2.5-flash'), // Using a smaller model for summarization within a tool
      prompt: `Summarize the following text to a ${input.length} length.\n\nText:\n${input.text}`,
      config: {
        temperature: 0.2,
      },
    });
    return { summary: output?.text || 'Could not summarize text.' };
  }
);

const generateImageTool = ai.defineTool(
  {
    name: 'generateImage',
    description: 'Generates an image based on a descriptive text prompt.',
    inputSchema: ImageGenerationInputSchema,
    outputSchema: ImageGenerationOutputSchema,
  },
  async (input) => {
    console.log(`Executing generateImage tool for prompt: ${input.prompt}`);
    try {
      const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: input.prompt,
      });
      if (!media || !media.url) {
        throw new Error('Image generation failed: no media returned.');
      }
      return { imageUrl: media.url };
    } catch (error: any) {
      console.error(`Image generation tool failed: ${error.message}`);
      // Return a placeholder or error image URL in case of failure
      return { imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' }; // 1x1 transparent PNG
    }
  }
);

const postToSocialMediaTool = ai.defineTool(
  {
    name: 'postToSocialMedia',
    description: 'Posts a message (and optionally an image) to a specified social media platform.',
    inputSchema: SocialMediaPostInputSchema,
    outputSchema: SocialMediaPostOutputSchema,
  },
  async (input) => {
    console.log(`Executing postToSocialMedia tool on ${input.platform}: "${input.message}"`);
    if (input.imageUrl) {
      console.log(`With image: ${input.imageUrl.substring(0, Math.min(input.imageUrl.length, 50))}...`);
    }
    // In a real application, this would integrate with social media APIs.
    const postId = `post_${Date.now()}`;
    return {
      status: 'success',
      postId,
      message: `Successfully posted to ${input.platform}. Post ID: ${postId}`,
    };
  }
);

// --- Main Flow Input/Output Schemas ---

const AIOrchestratedWorkflowExecutionInputSchema = z.object({
  goal: z.string().describe('The high-level natural language goal for the AI automation workflow.'),
  initialContext: z.record(z.any()).optional().describe('Optional initial data or context for the workflow.'),
});
export type AIOrchestratedWorkflowExecutionInput = z.infer<typeof AIOrchestratedWorkflowExecutionInputSchema>;

const AIOrchestratedWorkflowExecutionOutputSchema = z.object({
  finalOutput: z.string().describe('The final textual summary or outcome of the AI-orchestrated workflow.'),
  executedTools: z.array(z.object({
    name: z.string().describe('The name of the tool that was executed.'),
    input: z.any().describe('The input parameters provided to the tool.'),
    output: z.any().describe('The output result returned by the tool.'),
  })).describe('A log of all tools executed during the workflow.'),
});
export type AIOrchestratedWorkflowExecutionOutput = z.infer<typeof AIOrchestratedWorkflowExecutionOutputSchema>;

// --- Main Flow Definition ---

export async function aiOrchestratedWorkflowExecution(
  input: AIOrchestratedWorkflowExecutionInput
): Promise<AIOrchestratedWorkflowExecutionOutput> {
  return aiOrchestratedWorkflowExecutionFlow(input);
}

const aiOrchestratedWorkflowExecutionFlow = ai.defineFlow(
  {
    name: 'aiOrchestratedWorkflowExecutionFlow',
    inputSchema: AIOrchestratedWorkflowExecutionInputSchema,
    outputSchema: AIOrchestratedWorkflowExecutionOutputSchema,
  },
  async (input) => {
    const executedToolsLog: Array<{ name: string; input: any; output: any }> = [];
    let finalOutputText = '';
    // To correctly match tool responses to requests, we store the order of requests.
    const pendingToolRequests: { [name: string]: { input: any; order: number }[] } = {};

    const { output } = await ai.generate({
      model: ai.model('googleai/gemini-1.5-flash-latest'), // Using a capable model for orchestration
      tools: [webScrapeTool, summarizeTextTool, generateImageTool, postToSocialMediaTool],
      config: {
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        ],
      },
      prompt: [
        { text: `You are an intelligent AI workflow orchestrator. Your primary role is to analyze a high-level user goal and dynamically determine the most appropriate sequence of available tools to achieve it.\n        \n        Available tools:\n        - webScrape: Scrapes text content from a given URL.\n        - summarizeText: Summarizes text to a specified length (short, medium, long).\n        - generateImage: Generates an image based on a descriptive text prompt.\n        - postToSocialMedia: Posts a message (and optionally an image) to a specified social media platform.\n        \n        Think step-by-step. First, understand the goal. Then, decide which tools to use and in what order. If a tool's output is needed as input for another tool, ensure the data is correctly passed. Finally, provide a concise summary of the entire workflow execution and its outcome.\n\n        High-level Goal: ${input.goal}\n        ${input.initialContext ? `Initial Context: ${JSON.stringify(input.initialContext)}` : ''}\n        \n        Begin by explaining your plan, then execute tools, and finally provide the overall result.\n        `},
      ],
    });

    const parts = Array.isArray(output) ? output : (output ? [output] : []);

    for (const part of parts) {
      if (part.text) {
        finalOutputText += part.text;
      } else if (part.toolRequest) {
        if (!pendingToolRequests[part.toolRequest.name]) {
          pendingToolRequests[part.toolRequest.name] = [];
        }
        pendingToolRequests[part.toolRequest.name].push({
          input: part.toolRequest.input,
          order: executedToolsLog.length, // Store the order of the request
        });
        executedToolsLog.push({
          name: part.toolRequest.name,
          input: part.toolRequest.input,
          output: 'Pending...', // Placeholder until response is received
        });
      } else if (part.toolResponse) {
        const matchingRequestEntries = pendingToolRequests[part.toolResponse.name];
        const matchingRequestEntry = matchingRequestEntries ? matchingRequestEntries.shift() : undefined;

        if (matchingRequestEntry !== undefined) {
          // Update the corresponding entry in executedToolsLog using the stored order
          executedToolsLog[matchingRequestEntry.order].output = part.toolResponse.output;
        } else {
          // Fallback for an unmatched response (should ideally not happen in sequential execution)
          executedToolsLog.push({
            name: part.toolResponse.name,
            input: 'Unknown (no matching request found)',
            output: part.toolResponse.output,
          });
        }
      }
    }

    return {
      finalOutput: finalOutputText || 'No final output generated by the AI.',
      executedTools: executedToolsLog,
    };
  }
);
