import Dexie, { type Table } from 'dexie';

export interface ResumeRecord {
  id?: number;
  fileName: string;
  rawText: string;
  uploadedAt: Date;
}

export interface AnalysisRecord {
  id?: number;
  resumeId: number;
  domain: string;
  domainConfidence: number;
  domainReasoning: string;
  overallScore: number;
  band: string;
  createdAt: Date;
}

export interface CriterionRecord {
  id?: number;
  analysisId: number;
  name: string;
  score: number;
  explanation: string;
  evidence: string[];
}

export class AppDatabase extends Dexie {
  resumes!: Table<ResumeRecord>;
  analyses!: Table<AnalysisRecord>;
  criteria!: Table<CriterionRecord>;

  constructor() {
    super('AIReadinessDB');
    (this as any).version(1).stores({
      resumes: '++id, uploadedAt',
      analyses: '++id, resumeId',
      criteria: '++id, analysisId'
    });
  }
}

export const db = new AppDatabase();