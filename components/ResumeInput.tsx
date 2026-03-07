import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle2, Circle } from 'lucide-react';
import { extractTextFromPDF } from '../utils/pdfUtils';
import { ProcessingStage } from '../types';

interface ResumeInputProps {
  onAnalyze: (text: string, fileName: string) => void;
  isProcessing: boolean;
  processingStage?: ProcessingStage;
}

const ResumeInput: React.FC<ResumeInputProps> = ({ onAnalyze, isProcessing, processingStage = ProcessingStage.IDLE }) => {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    if (file.type === "application/pdf" || file.name.endsWith('.pdf')) {
      try {
        setIsParsing(true);
        const extractedText = await extractTextFromPDF(file);
        setText(extractedText);
      } catch (error) {
        console.error("PDF Parsing Error", error);
        alert("Could not extract text from this PDF. Please try a text-based PDF.");
        setFileName(null);
        setText('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } finally {
        setIsParsing(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setText(content);
      };
      reader.onerror = () => {
        alert("Failed to read file.");
        setFileName(null);
      };
      reader.readAsText(file); 
    }
  };

  const handleClear = () => {
    setText('');
    setFileName(null);
    setIsParsing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = () => {
    if (!text.trim()) return;
    const name = fileName || "Uploaded Resume";
    onAnalyze(text, name);
  };

  const steps = [
    { id: ProcessingStage.EXTRACTING, label: "Extracting Content" },
    { id: ProcessingStage.DETECTING_DOMAIN, label: "Identifying Domain" },
    { id: ProcessingStage.EVALUATING, label: "Evaluating Readiness" },
    { id: ProcessingStage.FINALIZING, label: "Finalizing Score" }
  ];

  // Helper to determine step status
  const getStepStatus = (stepId: string) => {
    const stages = Object.values(ProcessingStage);
    const currentIndex = stages.indexOf(processingStage);
    const stepIndex = stages.indexOf(stepId as ProcessingStage);

    if (stepIndex < currentIndex && currentIndex > 0) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  if (isProcessing) {
    return (
      <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl border border-indigo-100 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Analyzing Your Resume</h3>
        </div>

        <div className="space-y-4">
          {steps.map((step, idx) => {
             const status = getStepStatus(step.id);
             return (
               <div key={idx} className="flex items-center gap-4">
                  <div className="shrink-0">
                    {status === 'completed' && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                    {status === 'active' && <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />}
                    {status === 'pending' && <Circle className="w-6 h-6 text-slate-200" />}
                  </div>
                  <div className={`text-sm font-medium ${
                    status === 'active' ? 'text-indigo-700' : 
                    status === 'completed' ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </div>
               </div>
             )
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-6 text-center">Upload your Resume</h3>
        
        <div 
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
            fileName ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.txt,.md,.json,.csv"
            id="resume-upload"
          />
          
          {!fileName ? (
            <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-xl font-medium text-slate-700">Click to upload or drag and drop</p>
              <p className="text-sm text-slate-500 mt-2">PDF (text-based), TXT, or Markdown</p>
            </label>
          ) : (
            <div className="flex flex-col items-center">
              {isParsing ? (
                 <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 animate-spin">
                   <Loader2 className="w-8 h-8" />
                 </div>
              ) : (
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8" />
                </div>
              )}
              
              <p className="text-xl font-medium text-slate-700 break-all">{fileName}</p>
              
              {isParsing ? (
                <p className="text-sm text-indigo-600 font-medium mt-2">Extracting text from PDF...</p>
              ) : (
                <p className="text-sm text-slate-500 mt-2">{(text.length / 1024).toFixed(1)} KB extracted</p>
              )}
              
              {!isParsing && (
                <button 
                  onClick={handleClear}
                  className="mt-6 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 flex items-center gap-2 transition-colors"
                >
                  <X className="w-4 h-4" /> Remove File
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-8">
          <button
            onClick={handleAnalyze}
            disabled={!text.trim() || isParsing}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 transition-all text-lg ${
              !text.trim() || isParsing
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5'
            }`}
          >
            Generate Readiness Score
          </button>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
        <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
          <div className="font-semibold text-indigo-600 mb-1">Privacy First</div>
          <div className="text-xs text-slate-500">Processing happens in memory. We don't store your personal data.</div>
        </div>
        <div className="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
          <div className="font-semibold text-indigo-600 mb-1">Domain Adaptive</div>
          <div className="text-xs text-slate-500">Automatically detects your field and applies relevant criteria for audit.</div>
        </div>
      </div>
    </div>
  );
};

export default ResumeInput;