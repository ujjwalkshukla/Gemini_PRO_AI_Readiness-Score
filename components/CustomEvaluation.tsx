import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import * as api from '../services/api';
import { CustomEvaluationResult } from '../types';

interface CustomEvaluationProps {
  resumeId: number;
}

const CustomEvaluation: React.FC<CustomEvaluationProps> = ({ resumeId }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CustomEvaluationResult | null>(null);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const data = await api.evaluateCustomQuery(resumeId, query);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Custom Criterion Evaluation</h3>
      <p className="text-sm text-slate-500 mb-6">
        Want to know if you demonstrate specific skills like "Leadership", "Cloud Architecture", or "Strategic Planning"? 
        Ask below and we'll search your resume for evidence using our advanced Gemini 3 Pro model.
      </p>

      <form onSubmit={handleEvaluate} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Evaluate my evidence for Team Leadership..."
          className="w-full py-3 px-4 pr-12 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-700 bg-slate-50"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
             <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>

      {result && (
        <div className={`mt-6 p-5 rounded-xl border ${result.relevant ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-start gap-3">
            {result.relevant ? (
              <CheckCircle className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-slate-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold text-slate-800">
                  Result for "{result.query}"
                </h4>
                {result.relevant && result.score !== undefined && result.score !== null && (
                   <span className="px-2 py-0.5 bg-white text-indigo-700 text-xs font-bold rounded shadow-sm border border-indigo-100">
                     Score: {result.score}/100
                   </span>
                )}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">{result.explanation}</p>
              
              {result.evidence && result.evidence.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Evidence Found:</p>
                  {result.evidence.map((ev, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-slate-200 text-xs text-slate-600 italic border-l-4 border-l-indigo-300">
                      "{ev}"
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomEvaluation;