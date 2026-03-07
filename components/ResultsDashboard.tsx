import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { Award, Target, BookOpen, Quote, ChevronLeft, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import CustomEvaluation from './CustomEvaluation';
import { SCORE_BANDS } from '../constants';

interface ResultsDashboardProps {
  result: AnalysisResult;
  resumeId: number;
  onReset: () => void;
  onUpdateDomain: (newDomain: string) => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, resumeId, onReset, onUpdateDomain }) => {
  const [manualDomain, setManualDomain] = useState('');
  
  const getBandInfo = (score: number) => {
    if (score >= SCORE_BANDS.HIGH.min) return SCORE_BANDS.HIGH;
    if (score >= SCORE_BANDS.MEDIUM.min) return SCORE_BANDS.MEDIUM;
    return SCORE_BANDS.LOW;
  };

  const bandInfo = getBandInfo(result.overallScore);
  
  // Gauge visual settings
  const radius = 80;
  const stroke = 20;
  // ViewBox is 0 0 200 200. Center is 100,100.
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (result.overallScore / 100) * circumference;

  const handleDomainUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualDomain.trim()) {
      onUpdateDomain(manualDomain);
      setManualDomain('');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Navigation */}
      <button 
        onClick={onReset}
        className="group flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <div className="bg-white p-1 rounded-md shadow-sm border border-slate-200 mr-2 group-hover:border-indigo-200 transition-colors">
            <ChevronLeft className="w-4 h-4" />
        </div>
        Analyze another resume
      </button>

      {/* Hero Section: Score & Domain */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Left: Overall Score */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-center text-center relative overflow-visible">
          {/* Top colored accent line */}
          <div className={`absolute top-0 left-0 w-full h-1.5 rounded-t-[2rem] ${bandInfo.bg.replace('bg-', 'bg-gradient-to-r from-').replace('50', '400').split(' ')[0]} to-indigo-400`}></div>
          
          <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 mt-2">Overall Readiness</h2>
          
          <div className="relative mb-6 flex justify-center items-center">
            {/* Full Circle SVG Gauge - Fixed ViewBox to prevent cutting */}
             <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 200 200">
              {/* Background Circle */}
              <circle 
                cx="100" cy="100" r={radius} 
                stroke="currentColor" strokeWidth={stroke} fill="transparent" 
                className="text-slate-100" 
              />
              {/* Progress Circle */}
              <circle 
                cx="100" cy="100" r={radius} 
                stroke="currentColor" strokeWidth={stroke} fill="transparent" 
                className={bandInfo.color.replace('text-', 'stroke-')}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
              />
            </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-7xl font-bold tracking-tighter ${bandInfo.color}`}>
                {result.overallScore}
              </span>
              <span className="text-sm font-medium text-slate-400 mt-2">out of 100</span>
            </div>
          </div>

          <div className={`px-8 py-2.5 rounded-full text-lg font-bold ${bandInfo.bg} ${bandInfo.color} mb-4`}>
            {result.band}
          </div>
          <p className="text-slate-400 text-xs">Grounded in Resume Evidence</p>
        </div>

        {/* Right: Context & Summary */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 flex flex-col relative overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Target className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Target Domain</h3>
                <div className="text-2xl font-bold text-slate-800 leading-none">{result.domain.domain}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">AI Confidence</div>
              <div className="text-xl font-bold text-indigo-600">{Math.round(result.domain.confidence * 100)}%</div>
            </div>
          </div>
          
          {/* Reasoning Box */}
          <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100 mb-8 flex-grow">
             <div className="text-slate-600 text-sm leading-relaxed">
               {result.domain.reasoning}
             </div>
          </div>

          {/* Domain Override Input - Clean White Style */}
          <div className="mt-auto">
            <label className="text-xs font-bold text-slate-500 block mb-3">Not your domain? Provide yours:</label>
            <form onSubmit={handleDomainUpdate} className="flex gap-3">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={manualDomain}
                  onChange={(e) => setManualDomain(e.target.value)}
                  placeholder="e.g. Healthcare Administration"
                  className="w-full pl-4 pr-4 py-3 rounded-xl bg-white text-slate-800 placeholder-slate-400 border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all shadow-sm"
                />
              </div>
              <button 
                type="submit"
                disabled={!manualDomain.trim()}
                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                Update <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Performance by Criteria */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 px-1">
          <Award className="w-6 h-6 text-indigo-600" />
          Performance Snapshot
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {result.criteria.map((c, idx) => {
              const band = getBandInfo(c.score);
              return (
                <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${band.bg.replace('bg-', 'bg-current text-')}`}></div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4 h-12">
                          <div className="font-bold text-slate-700 leading-tight text-sm md:text-base pr-2">
                            {c.name}
                          </div>
                      </div>
                      
                      <div className="flex justify-between items-end mb-3">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${band.bg} ${band.color}`}>
                            {band.label}
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-bold ${band.color}`}>{c.score}</span>
                            <span className="text-xs text-slate-400 font-medium">/100</span>
                          </div>
                      </div>

                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${band.color.replace('text-', 'bg-')}`} 
                            style={{ width: `${c.score}%` }}
                          ></div>
                      </div>
                    </div>
                </div>
              )
           })}
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 gap-8">
        <div>
           <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 px-1">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Evidence & Analysis
          </h3>
          
          <div className="space-y-6">
            {result.criteria.map((criterion, idx) => {
              const band = getBandInfo(criterion.score);
              return (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-md">
                   {/* Left Sidebar for Score */}
                   <div className={`md:w-36 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-100 ${band.bg} bg-opacity-30`}>
                      <div className={`text-4xl font-bold ${band.color} mb-2`}>{criterion.score}</div>
                      <div className={`text-[10px] font-bold uppercase tracking-wider ${band.color} text-center px-3 py-1 bg-white bg-opacity-60 rounded-full`}>
                         {band.label}
                      </div>
                   </div>

                   {/* Content */}
                   <div className="flex-1 p-6 md:p-8">
                      <h4 className="text-lg font-bold text-slate-800 mb-3">{criterion.name}</h4>
                      <p className="text-slate-600 leading-relaxed mb-6 text-sm md:text-base border-l-2 border-slate-200 pl-4">{criterion.explanation}</p>
                      
                      <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100">
                         <h5 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                            <Quote className="w-3 h-3" /> Resume Evidence
                         </h5>
                         <div className="">
                           {criterion.evidence.length > 0 ? (
                             <ul className="space-y-3">
                               {criterion.evidence.map((ev, i) => (
                                 <li key={i} className="flex gap-3 text-sm text-slate-700">
                                   <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                                   <span className="italic">"{ev}"</span>
                                 </li>
                               ))}
                             </ul>
                           ) : (
                             <div className="text-sm text-slate-400 italic flex items-center gap-2">
                               <AlertTriangle className="w-4 h-4" /> No direct evidence found in resume.
                             </div>
                           )}
                         </div>
                      </div>
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <CustomEvaluation resumeId={resumeId} />
    </div>
  );
};

export default ResultsDashboard;