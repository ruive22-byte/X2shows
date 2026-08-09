// @ts-nocheck
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AutoErrorCatcher extends Component<Props, State> {
  override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 [AutoErrorCatcher] Uncaught UI Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private copyCrashReportForAi = () => {
    const payload = {
      timestamp: new Date().toISOString(),
      errorName: this.state.error?.name,
      errorMessage: this.state.error?.message,
      stackTrace: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
    };

    const promptText = `My React streaming app crashed with a runtime error. Fix the bug causing this stack trace:\n\n\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\``;
    
    navigator.clipboard.writeText(promptText);
    alert('Copied Crash Diagnostic Prompt to clipboard! Paste it directly to the AI.');
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07151e] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="p-4 bg-red-950/80 border-2 border-red-500 rounded-3xl max-w-xl shadow-[6px_6px_0px_#000000] space-y-3">
            <h2 className="text-lg font-black text-red-400">🚨 Automatic Error Shield Activated</h2>
            <p className="text-xs text-gray-300">
              A runtime error occurred in the player stage or UI rendering tree.
            </p>
            <div className="p-2 bg-black/60 rounded-xl text-left text-[11px] font-mono text-red-300 max-h-36 overflow-y-auto">
              {this.state.error?.toString()}
            </div>
            <button
              onClick={this.copyCrashReportForAi}
              className="w-full py-2 bg-[#00f2fe] text-black font-black text-xs rounded-xl border border-black hover:scale-105 transition-all cursor-pointer shadow-[2px_2px_0px_#000000]"
            >
              📋 Copy Crash Report Prompt for AI
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 bg-[#0d2836] text-white font-black text-xs rounded-xl border border-black hover:bg-black/40 cursor-pointer"
            >
              🔄 Reload Player App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
