"use server";

const { CohereClientV2 } = require('cohere-ai');
const COHERE_TOKEN = process.env.COHERE;
// console.log(COHERE_TOKEN)
const cohere = new CohereClientV2({
  token: COHERE_TOKEN,
});

export interface AnalysisRequest{
  type: "chord" | "scale" | "progression"
  chord?: string              // e.g. "E minor7"
  scale?: string
  progression?: string[]      // e.g. ["D# major", "Fm", "Gm", "A# major"]
  key?: string                // e.g. "D# Major"
  detectedNotes?: string[]    // e.g. ["E", "G", "B", "D"]
}

export async function analyzeWithCohere(req: AnalysisRequest): Promise<string> {
  const userMessage = req.type === "chord" 
    ? `Analyze this chord for me: ${req.chord}.
      ${req.detectedNotes ? `Notes: ${req.detectedNotes.join(", ")}` : ""}
      What key does it fit in and what chords go well with it?`
    : req.type === "progression" 
    ? `Analyze this chord progression: ${req.progression?.join(" → ")}.
       Key: ${req.key ?? "unknown"}.
       What's the feel of this progression and what song uses something similar?`
    : req.type === "scale"
    ? `Analyze this scale: ${req.scale}.
       Key: ${req.key ?? "unknown"}.
       What's the feel of this scale and what song examples uses something similar?`
    : "Explain to me music theory in general"

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