'use server';
/**
 * @fileOverview An AI Decision node flow that analyzes input data (text or image) and routes the workflow
 * based on the AI's assessment.
 *
 * - aiBasedConditionalRouting - A function that handles the AI decision-making process.
 * - AiBasedConditionalRoutingInput - The input type for the aiBasedConditionalRouting function.
 * - AiBasedConditionalRoutingOutput - The return type for the aiBasedConditionalRouting function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiBasedConditionalRoutingInputSchema = z.object({
  textData: z.string().optional().describe('Text data for the AI to analyze.'),
  imageDataUri: z.string().optional().describe(
    "Image data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  dataType: z.enum(["text_sentiment", "image_classification", "message_intent", "general_decision"])
             .describe('The type of data to analyze (e.g., "text_sentiment", "image_classification").'),
  options: z.array(z.string()).describe('An array of possible routing paths/decisions the AI can choose from.'),
  promptInstructions: z.string().optional().describe('Additional instructions for the AI on how to make the decision.'),
}).refine(
  (data) => (data.textData !== undefined) !== (data.imageDataUri !== undefined),
  "Exactly one of 'textData' or 'imageDataUri' must be provided."
);
export type AiBasedConditionalRoutingInput = z.infer<typeof AiBasedConditionalRoutingInputSchema>;

const AiBasedConditionalRoutingOutputSchema = z.object({
  decision: z.string().describe('The chosen routing path/decision from the provided options.'),
  reasoning: z.string().describe('The AI\'s explanation for its decision.'),
});
export type AiBasedConditionalRoutingOutput = z.infer<typeof AiBasedConditionalRoutingOutputSchema>;

export async function aiBasedConditionalRouting(input: AiBasedConditionalRoutingInput): Promise<AiBasedConditionalRoutingOutput> {
  return aiBasedConditionalRoutingFlow(input);
}

const aiDecisionPrompt = ai.definePrompt({
  name: 'aiDecisionPrompt',
  input: { schema: AiBasedConditionalRoutingInputSchema },
  output: { schema: AiBasedConditionalRoutingOutputSchema },
  prompt: `You are an intelligent decision-making AI. Your task is to analyze the provided input data and choose the most appropriate option from a given list.

Data Type: {{{dataType}}}
Input Data:
{{#if imageDataUri}}
  {{media url=imageDataUri}}
{{else}}
  {{{textData}}}
{{/if}}

Available Options:
{{#each options}}
- {{{this}}}
{{/each}}

{{#if promptInstructions}}
Additional Instructions: {{{promptInstructions}}}
{{/if}}

Based on the Data Type and Input Data, and considering the Available Options, choose ONE option that best fits the analysis. The output MUST be a JSON object with a "decision" field (one of the provided options) and a "reasoning" field (your explanation).`,
});

const aiBasedConditionalRoutingFlow = ai.defineFlow(
  {
    name: 'aiBasedConditionalRoutingFlow',
    inputSchema: AiBasedConditionalRoutingInputSchema,
    outputSchema: AiBasedConditionalRoutingOutputSchema,
  },
  async (input) => {
    const { output } = await aiDecisionPrompt(input);
    if (!output) {
      throw new Error('AI decision prompt returned no output.');
    }
    // Ensure the decision is one of the provided options (model might hallucinate)
    if (!input.options.includes(output.decision)) {
      throw new Error(`AI made a decision "${output.decision}" not present in the allowed options.`);
    }
    return output;
  }
);
