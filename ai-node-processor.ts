'use server';
/**
 * @fileOverview A general AI node processor flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiNodeProcessorInputSchema = z.object({
  content: z.string().describe('The input content to process.'),
  instruction: z.string().describe('The instruction for the AI to follow (e.g., summarize, extract tags).'),
});
export type AiNodeProcessorInput = z.infer<typeof AiNodeProcessorInputSchema>;

const AiNodeProcessorOutputSchema = z.object({
  output: z.string().describe('The result of the AI processing.'),
});
export type AiNodeProcessorOutput = z.infer<typeof AiNodeProcessorOutputSchema>;

export async function aiNodeProcessor(input: AiNodeProcessorInput): Promise<AiNodeProcessorOutput> {
  const { output } = await ai.generate({
    prompt: `Instruction: ${input.instruction}\n\nContent:\n${input.content}`,
    output: { schema: AiNodeProcessorOutputSchema }
  });
  if (!output) throw new Error('AI processing failed.');
  return output;
}
