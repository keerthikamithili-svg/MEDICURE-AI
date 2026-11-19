import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('MediCure ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-[#E2E8F0] rounded-xl p-6 clinical-shadow">
            <div className="flex items-center gap-3 text-[#DC2626] mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="text-lg font-bold font-display text-[#0B1C30]">
                Clinical Session Notice
              </h2>
            </div>
            <p className="text-sm text-[#42474E] mb-4">
              An unexpected error interrupted this clinical view. Your session data remains safely stored.
            </p>
            <pre className="text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 overflow-auto max-h-40 text-[#64748B] font-mono-tabular mb-4">
              {this.state.errorMessage}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#002541] text-white text-sm font-medium rounded-lg hover:bg-[#123B5D] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Portal
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
