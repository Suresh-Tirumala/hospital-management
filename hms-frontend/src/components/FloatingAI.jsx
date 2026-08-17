import React, { useState, lazy, Suspense } from 'react';
import { GiBrain } from 'react-icons/gi';
import { FiX } from 'react-icons/fi';
import { ChatProvider } from '../features/ai-assistant/hooks/useChat';

const ChatInterface = lazy(() => import('../features/ai-assistant/components/ChatInterface'));

export default function FloatingAI() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl cursor-pointer group"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
        title="AI Medical Assistant"
      >
        <GiBrain size={22} />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-end">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div
            className="relative w-full sm:w-[400px] h-[80vh] sm:h-[75vh] mr-0 sm:mr-5 mb-0 sm:mb-5 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col bg-white"
            style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
            >
              <div className="flex items-center gap-2">
                <GiBrain size={18} />
                <span className="font-semibold text-sm">AI Assistant</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <ChatProvider>
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-full bg-slate-50">
                      <div className="text-center">
                        <div className="w-7 h-7 border-[3px] border-slate-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-xs text-slate-400">Loading...</p>
                      </div>
                    </div>
                  }
                >
                  <ChatInterface />
                </Suspense>
              </ChatProvider>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
