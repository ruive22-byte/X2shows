import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public state: State;

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center bg-[#07151e] text-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000000]">
          <h2 className="text-lg font-black text-[#00f2fe]">
            {this.props.fallbackTitle || 'Player Encountered an Issue'}
          </h2>
          <p className="text-xs text-[#99f6e4] mt-2">
            {this.state.error?.message || 'Try refreshing or switching to a backup server.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#00f2fe] text-black font-bold rounded-xl shadow-[2px_2px_0px_#000] hover:bg-[#38ef7d] transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
