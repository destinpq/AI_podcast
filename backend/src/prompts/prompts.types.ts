// Define the expected structure of the JSON response from prompt generation
export interface GeneratedPrompts {
  researchPrompt: string;
  structurePrompt: string;
  introPrompt: string;
  segmentPrompts: string[];
  factCheckPrompt: string;
  conclusionPrompt: string;
}

// DTO for the controller input
export interface GeneratePromptsDto {
  topic: string;
  mood: string;
  duration: number;
} 