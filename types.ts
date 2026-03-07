export interface ResumeData {
  text: string;
  fileName?: string;
}

export interface DomainResult {
  domain: string;
  confidence: number;
  reasoning: string;
}

export interface Criterion {
  id: string;
  name: string;
  score: number;
  explanation: string;
  evidence: string[];
}

export interface AnalysisResult {
  domain: DomainResult;
  overallScore: number;
  band: string;
  criteria: Criterion[];
}

export interface CustomEvaluationResult {
  query: string;
  relevant: boolean;
  score?: number;
  explanation: string;
  evidence?: string[];
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  PROCESSING = 'PROCESSING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export enum ProcessingStage {
  IDLE = 'idle',
  EXTRACTING = 'Extracting resume content...',
  DETECTING_DOMAIN = 'Identifying professional domain...',
  EVALUATING = 'Evaluating readiness criteria...',
  FINALIZING = 'Finalizing score...'
}
