import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, DomainResult, CustomEvaluationResult } from "../types";

// Initialize Gemini Client Lazily
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API Key is missing. For GitHub Pages deployment, ensure the key is provided during the build process or via environment variables.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

// Model Constants
const FAST_MODEL = 'gemini-2.0-flash';
const PRO_MODEL = 'gemini-2.0-flash';

export const detectDomain = async (resumeText: string): Promise<DomainResult> => {
  const ai = getAI();
  const prompt = `
    Analyze the following resume text and detect the primary professional domain (e.g., Data Science, Software Engineering, Marketing, Finance, Sales, Design, Product Management).
    Provide a confidence score (0.0 to 1.0) and a brief reasoning.
    
    Resume Text:
    ${resumeText.slice(0, 5000)}
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      domain: { type: Type.STRING },
      confidence: { type: Type.NUMBER },
      reasoning: { type: Type.STRING },
    },
    required: ["domain", "confidence", "reasoning"],
  };

  try {
    const response = await ai.models.generateContent({
      model: FAST_MODEL, // Flash is sufficient for classification
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result as DomainResult;
  } catch (error) {
    console.error("Domain detection failed:", error);
    throw new Error("Failed to detect domain from resume.");
  }
};

export const evaluateReadiness = async (resumeText: string, domain: string): Promise<AnalysisResult> => {
  const ai = getAI();
  const prompt = `
    TARGET DOMAIN for Audit: "${domain}"

    You are a specialized AI Workforce Auditor. Your task is to perform a strict, gap-analysis audit of a resume against the specific requirements of the TARGET DOMAIN.

    PHASE 1: DEFINE THE STANDARD (Independent of Resume)
    First, establish the 3 critical "Pillars of AI Readiness" for an expert specifically in "${domain}".
    - These pillars must be industry-standard hard skills or workflows for ${domain}.
    - Do NOT adapt these pillars to what the candidate knows. They must be objective.
    - Example: If Target is "Product Management", pillars might be "Data-Driven Strategy", "AI Product Lifecycle", "User-Centric AI UX". 
    - Example: If Target is "Data Science", pillars might be "Deep Learning Architectures", "MLOps Pipelines", "Statistical Rigor".

    PHASE 2: EXECUTE AUDIT (Strict Scoring)
    Evaluate the provided RESUME against the pillars defined in Phase 1.
    
    SCORING RULES:
    1. DETECT MISMATCH: If the resume is for a different profession (e.g., Candidate is a "Teacher" but Target is "Software Engineering"), scores for technical pillars MUST be LOW (0-30). Do not hallucinate transferrable skills where none exist.
    2. EVIDENCE REQUIRED: A score > 60 requires EXPLICIT mention of relevant tools, projects, or methodologies in the text.
    3. PENALIZE GENERICISM: Knowing "ChatGPT" does not qualify someone for "LLM Fine-tuning". Be skeptical.

    OUTPUT FORMAT:
    Provide the overall score, a readiness band, and the 3 specific criteria with their individual scores and strict evidence-based reasoning.

    RESUME TEXT:
    ${resumeText.slice(0, 20000)}
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      overallScore: { type: Type.NUMBER, description: "Average of the 3 criteria scores" },
      band: { type: Type.STRING, enum: ["AI Ready", "Developing", "Needs Preparation"] },
      criteria: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING, description: "The name of the domain-specific pillar" },
            score: { type: Type.NUMBER, description: "0-100 score based on evidence" },
            explanation: { type: Type.STRING, description: "Why this score was given, highlighting gaps if low." },
            evidence: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Direct quotes from resume supporting the score. Empty if low score."
            },
          },
          required: ["name", "score", "explanation", "evidence"],
        },
      },
    },
    required: ["overallScore", "band", "criteria"],
  };

  try {
    // Use Gemini 3 Pro for complex reasoning and evaluation
    const response = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        // Set a system instruction to reinforce the persona
        systemInstruction: "You are a harsh, fact-based auditor. You do not give the benefit of the doubt. You prioritize domain-specific expertise over generic soft skills.",
      },
    });

    const result = JSON.parse(response.text || "{}");
    // Re-attach domain info since this call focuses on evaluation
    return {
      domain: { domain, confidence: 1, reasoning: "Pre-detected" },
      ...result
    } as AnalysisResult;
  } catch (error) {
    console.error("Readiness evaluation failed:", error);
    throw new Error("Failed to evaluate resume readiness.");
  }
};

export const evaluateCustomCriterion = async (resumeText: string, query: string): Promise<CustomEvaluationResult> => {
  const ai = getAI();
  const prompt = `
    User Query: "Evaluate my readiness regarding: ${query}"
    
    Task:
    1. Check if the resume contains ANY evidence related to "${query}".
    2. If NO evidence is found, set 'relevant' to false and explain politely.
    3. If evidence IS found, set 'relevant' to true, assign a score (0-100), explain why based on the evidence, and list the evidence snippets.
    
    Resume Text:
    ${resumeText.slice(0, 15000)}
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      relevant: { type: Type.BOOLEAN },
      score: { type: Type.NUMBER, nullable: true },
      explanation: { type: Type.STRING },
      evidence: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        nullable: true
      },
    },
    required: ["relevant", "explanation"],
  };

  try {
    // Use Gemini 3 Pro for ad-hoc custom queries to ensure high quality grounding
    const response = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      query,
      ...result
    } as CustomEvaluationResult;
  } catch (error) {
    console.error("Custom evaluation failed:", error);
    throw new Error("Failed to process custom evaluation request.");
  }
};
