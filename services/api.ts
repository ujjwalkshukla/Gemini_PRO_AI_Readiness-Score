import { db } from '../db/schema';
import * as gemini from './geminiService';
import { AnalysisResult, CustomEvaluationResult } from '../types';

/**
 * API Layer
 * Mimics a backend controller architecture.
 * Handles database operations (Tables) and Service calls (AI).
 */

export const uploadResume = async (fileName: string, text: string): Promise<number> => {
  try {
    const id = await db.resumes.add({
      fileName: fileName,
      rawText: text,
      uploadedAt: new Date()
    });
    return id as number;
  } catch (error) {
    console.error("API: uploadResume failed", error);
    throw new Error("Failed to store resume.");
  }
};

export const processResumeAnalysis = async (resumeId: number): Promise<{ analysisId: number; result: AnalysisResult }> => {
  try {
    // 1. Fetch Resume from DB Table
    const resume = await db.resumes.get(resumeId);
    if (!resume) throw new Error("Resume record not found");

    // 2. Detect Domain (Service Call)
    const domainResult = await gemini.detectDomain(resume.rawText);

    // 3. Evaluate Readiness (Service Call - Gemini 3 Pro)
    const evaluation = await gemini.evaluateReadiness(resume.rawText, domainResult.domain);

    // 4. Persist Analysis Results to 'analyses' Table
    const analysisId = await db.analyses.add({
      resumeId,
      domain: domainResult.domain,
      domainConfidence: domainResult.confidence,
      domainReasoning: domainResult.reasoning,
      overallScore: evaluation.overallScore,
      band: evaluation.band,
      createdAt: new Date()
    }) as number;

    // 5. Persist Criteria to 'criteria' Table
    await db.criteria.bulkAdd(evaluation.criteria.map(c => ({
      analysisId,
      name: c.name,
      score: c.score,
      explanation: c.explanation,
      evidence: c.evidence
    })));

    return { analysisId, result: evaluation };
  } catch (error) {
    console.error("API: processResumeAnalysis failed", error);
    throw error;
  }
};

export const reanalyzeWithDomain = async (resumeId: number, manualDomain: string): Promise<{ analysisId: number; result: AnalysisResult }> => {
  try {
    // 1. Fetch Resume
    const resume = await db.resumes.get(resumeId);
    if (!resume) throw new Error("Resume record not found");

    // 2. Skip Detection, Use Manual Domain
    const domainResult = {
      domain: manualDomain,
      confidence: 1.0,
      reasoning: "User manually selected this domain."
    };

    // 3. Evaluate Readiness against NEW domain
    const evaluation = await gemini.evaluateReadiness(resume.rawText, manualDomain);

    // 4. Persist New Analysis
    const analysisId = await db.analyses.add({
      resumeId,
      domain: domainResult.domain,
      domainConfidence: domainResult.confidence,
      domainReasoning: domainResult.reasoning,
      overallScore: evaluation.overallScore,
      band: evaluation.band,
      createdAt: new Date()
    }) as number;

    // 5. Persist Criteria
    await db.criteria.bulkAdd(evaluation.criteria.map(c => ({
      analysisId,
      name: c.name,
      score: c.score,
      explanation: c.explanation,
      evidence: c.evidence
    })));

    return { analysisId, result: { ...evaluation, domain: domainResult } };
  } catch (error) {
    console.error("API: reanalyzeWithDomain failed", error);
    throw error;
  }
};

export const getAnalysisResult = async (analysisId: number): Promise<AnalysisResult> => {
  // Fetch from Tables
  const analysis = await db.analyses.get(analysisId);
  if (!analysis) throw new Error("Analysis not found");

  const criteriaRecs = await db.criteria.where('analysisId').equals(analysisId).toArray();

  // Reconstruct the Response Object
  return {
    domain: {
      domain: analysis.domain,
      confidence: analysis.domainConfidence,
      reasoning: analysis.domainReasoning
    },
    overallScore: analysis.overallScore,
    band: analysis.band,
    criteria: criteriaRecs.map(c => ({
      id: c.id?.toString() || '',
      name: c.name,
      score: c.score,
      explanation: c.explanation,
      evidence: c.evidence
    }))
  };
};

export const evaluateCustomQuery = async (resumeId: number, query: string): Promise<CustomEvaluationResult> => {
  const resume = await db.resumes.get(resumeId);
  if (!resume) throw new Error("Resume not found");

  // Call Gemini Service (Gemini 3 Pro)
  return gemini.evaluateCustomCriterion(resume.rawText, query);
};
