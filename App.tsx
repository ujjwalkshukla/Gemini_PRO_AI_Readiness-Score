import React, { useState } from 'react';
import Layout from './components/ui/Layout';
import ResumeInput from './components/ResumeInput';
import ResultsDashboard from './components/ResultsDashboard';
import { AppState, ProcessingStage, AnalysisResult } from './types';
import * as api from './services/api';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>(ProcessingStage.IDLE);
  
  // State now tracks IDs for backend tables
  const [currentResumeId, setCurrentResumeId] = useState<number | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async (text: string, fileName: string) => {
    setAppState(AppState.PROCESSING);
    setError(null);
    setAnalysisResult(null);
    setCurrentResumeId(null);

    try {
      // Step 1: Upload to Backend (DB Table)
      setProcessingStage(ProcessingStage.EXTRACTING);
      const resumeId = await api.uploadResume(fileName, text);
      setCurrentResumeId(resumeId);

      // Step 2: Detect Domain
      setProcessingStage(ProcessingStage.DETECTING_DOMAIN);
      
      // Step 3: Evaluate Readiness (Trigger Backend Processing)
      setProcessingStage(ProcessingStage.EVALUATING);
      const { result } = await api.processResumeAnalysis(resumeId);
      
      console.log("Evaluation complete:", result);

      setAnalysisResult(result);
      setProcessingStage(ProcessingStage.FINALIZING);
      
      // Small delay for UX transition
      setTimeout(() => {
        setAppState(AppState.RESULTS);
      }, 800);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unknown error occurred during analysis.");
      setAppState(AppState.ERROR);
    } finally {
      setProcessingStage(ProcessingStage.IDLE);
    }
  };

  const handleUpdateDomain = async (newDomain: string) => {
    if (!currentResumeId) return;
    
    // Switch to processing view to show progress and hide old results
    setAppState(AppState.PROCESSING);
    setAnalysisResult(null); // Clear old result
    setProcessingStage(ProcessingStage.EVALUATING); // Start at evaluating stage
    
    try {
      // Re-run evaluation with the new domain
      const { result } = await api.reanalyzeWithDomain(currentResumeId, newDomain);
      setAnalysisResult(result);
      
      setProcessingStage(ProcessingStage.FINALIZING);
      
      setTimeout(() => {
        setAppState(AppState.RESULTS);
      }, 800);
    } catch (err: any) {
      console.error("Domain update failed", err);
      setError("Failed to update domain. Please try again.");
      setAppState(AppState.ERROR);
    } finally {
      setProcessingStage(ProcessingStage.IDLE);
    }
  };

  const handleReset = () => {
    setAppState(AppState.UPLOAD);
    setCurrentResumeId(null);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <Layout>
      {appState === AppState.ERROR && (
        <div className="max-w-2xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="flex-1">
             <h3 className="font-semibold">Analysis Failed</h3>
             <p className="text-sm">{error}</p>
          </div>
          <button onClick={handleReset} className="text-sm underline hover:text-red-900">Try Again</button>
        </div>
      )}

      {appState === AppState.UPLOAD || appState === AppState.PROCESSING || appState === AppState.ERROR ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Are you ready for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">AI Workforce?</span></h2>
            <p className="text-lg text-slate-500">
              Get an instant, evidence-based AI Readiness Score grounded entirely in your resume using domain-adaptive analysis.
            </p>
          </div>

          <div className="w-full">
            <ResumeInput 
              onAnalyze={handleAnalysis} 
              isProcessing={appState === AppState.PROCESSING}
              processingStage={processingStage}
            />
          </div>
        </div>
      ) : (
        analysisResult && currentResumeId && (
          <ResultsDashboard 
            result={analysisResult} 
            resumeId={currentResumeId}
            onReset={handleReset}
            onUpdateDomain={handleUpdateDomain}
          />
        )
      )}
    </Layout>
  );
};

export default App;