import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { APP_NAME } from '../../constants';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-8 h-8 text-indigo-600" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              {APP_NAME}
            </h1>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full border border-slate-200">v1.1 MVP</span>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} AI Readiness Score Tool. Powered by Gemini.</p>
          <p className="mt-2 text-xs">Uploaded resumes are processed in memory and not stored.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;