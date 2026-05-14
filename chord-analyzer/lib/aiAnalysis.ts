"use server";

import { DiatonicChord } from "./progressionLogic";

const { CohereClientV2 } = require('cohere-ai');
const COHERE_TOKEN = process.env.COHERE;
// console.log(COHERE_TOKEN)
const cohere = new CohereClientV2({
  token: COHERE_TOKEN,
});

type ChordAnalysisRequest = {
  type: "chord";
  chord: string;
  detectedNotes?: string[];
};

type ScaleAnalysisRequest = {
  type: "scale";
  scale: string;
  key?: string;
};

type ProgressionAnalysisRequest = {
  type: "progression";
  progression: string[];
  key?: string;
};

export type AnalysisRequest =
  | ChordAnalysisRequest
  | ScaleAnalysisRequest
  | ProgressionAnalysisRequest;

function analyzeChord(req: ChordAnalysisRequest): string {
  return `Analyze this chord for me: ${req.chord}.
    ${req.detectedNotes ? `Notes: ${req.detectedNotes.join(", ")}` : ""}
    What key does it fit in and what chords go well with it?`;
}

function analyzeScale(req: ScaleAnalysisRequest): string {
  return `Analyze this scale: ${req.scale}.
  Key: ${req.key ?? "unknown"}.
  What's the feel of this scale and what song examples use something similar?`;
}

function analyzeProgression(req: ProgressionAnalysisRequest): string {
  return `Analyze this chord progression: ${req.progression.join(" -> ")}.
  Key: ${req.key ?? "unknown"}.
  What's the feel of this progression and what song uses something similar? include all types of genre ranging from classical pieces like canon in D to Jpop and Kpop`;
}

export async function analyzeWithCohere(req: AnalysisRequest): Promise<string> {
  let userMessage: string;

  switch (req.type) {
    case "chord":
      userMessage = analyzeChord(req);
      break;

    case "scale":
      userMessage = analyzeScale(req);
      break;

    case "progression":
      userMessage = analyzeProgression(req);
      break;

    default:
      return `Explain to me music theory in general`;
  }
  try {
    const response = await cohere.chat({
      model: 'command-r-08-2024',
      messages: [
        { role: 'user', content: userMessage },
      ],
    });
    
    // The SDK automatically parsed the JSON! Just grab the text directly.
    return response.message?.content?.[0]?.text ?? "Could not analyze.";
    
  } catch (error) {
    console.error("Cohere API Error:", error);
    return "Error connecting to AI Assistant. Please try again.";
  }
}